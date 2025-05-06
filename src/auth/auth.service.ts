import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ConfigService } from '@nestjs/config';
import {
  PhoneOtp,
  Role,
  User,
  Prisma,
  AccountStatus,
  RefreshToken,
  UserRole,
} from '@prisma/client';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './strategies/jwt.strategy';
import { SmsService } from '../sms/sms.service';
import * as bcrypt from 'bcrypt';
import { RefreshTokenPayload } from './strategies/refresh-token.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ClientProfile, LawyerProfile } from '@prisma/client';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { AddRoleDto } from './dto/add-role.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ResendService } from '../resend/resend.service';
import {
  EmailOtpRequestDto,
  EmailOtpVerifyDto,
  UnifiedOtpRequestDto,
  UnifiedOtpVerifyDto,
} from './dto/email-otp.dto';
import { addMinutes } from 'date-fns';

interface EmailMetrics {
  totalRequests: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  lastError: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly HASH_ROUNDS = 10;
  private readonly otpRequestLimits = new Map<
    string,
    { count: number; lastRequest: Date }
  >();
  private readonly MAX_REQUESTS_PER_HOUR = 5;
  private readonly ALLOWED_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
  ];
  private emailMetrics: EmailMetrics = {
    totalRequests: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    lastError: null,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly resendService: ResendService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateTokens(
    payload: JwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.debug(
      `Generating tokens for user ID: ${payload.sub} with roles: ${payload.roles.join(', ')} and profileId: ${payload.profileId}`,
    );

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
    });
    this.logger.debug(`Generated access token for user ID: ${payload.sub}`);

    const refreshTokenPayload = {
      sub: payload.sub,
    };

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    });
    this.logger.debug(`Generated refresh token for user ID: ${payload.sub}`);

    return { accessToken, refreshToken };
  }

  private async hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(token, this.HASH_ROUNDS);
  }

  private calculateRefreshTokenExpiry(): Date {
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION_TIME',
    );

    if (!expiresIn) {
      this.logger.error(
        'JWT_REFRESH_EXPIRATION_TIME is not defined in environment variables.',
      );
      throw new InternalServerErrorException(
        'Server configuration error: Refresh token expiration time is missing.',
      );
    }

    const value = parseInt(expiresIn.slice(0, -1), 10);
    const unit = expiresIn.slice(-1);

    if (isNaN(value)) {
      this.logger.error(
        `Invalid format for JWT_REFRESH_EXPIRATION_TIME: ${expiresIn}. Could not parse numeric value.`,
      );
      throw new InternalServerErrorException(
        'Server configuration error: Invalid refresh token expiration time format.',
      );
    }

    let multiplier = 1000;
    if (unit === 's') multiplier = 1000;
    else if (unit === 'm') multiplier = 60 * 1000;
    else if (unit === 'h') multiplier = 60 * 60 * 1000;
    else if (unit === 'd') multiplier = 24 * 60 * 60 * 1000;
    else {
      this.logger.error(
        `Invalid unit in JWT_REFRESH_EXPIRATION_TIME: ${expiresIn}. Unit must be 's', 'm', 'h', or 'd'.`,
      );
      throw new InternalServerErrorException(
        'Server configuration error: Invalid refresh token expiration time unit.',
      );
    }

    return new Date(Date.now() + value * multiplier);
  }

  private checkRateLimit(identifier: string): void {
    const now = new Date();
    const limit = this.otpRequestLimits.get(identifier);

    if (limit) {
      const timeDiff = now.getTime() - limit.lastRequest.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 1) {
        if (limit.count >= this.MAX_REQUESTS_PER_HOUR) {
          throw new HttpException(
            'Too many OTP requests. Please try again later.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        limit.count++;
      } else {
        limit.count = 1;
      }
      limit.lastRequest = now;
    } else {
      this.otpRequestLimits.set(identifier, { count: 1, lastRequest: now });
    }
  }

  private validateEmailDomain(email: string): void {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain || !this.ALLOWED_DOMAINS.includes(domain)) {
      throw new BadRequestException(
        'Email domain not allowed. Please use a supported email provider.',
      );
    }
  }

  async requestOtp(requestOtpDto: RequestOtpDto): Promise<PhoneOtp> {
    const { phoneNumber, role } = requestOtpDto;
    this.logger.log(`OTP requested for phone: ${phoneNumber}, role: ${role}`);

    const existingUserWithRoles = await this.prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        userRoles: {
          select: { role: true, isActive: true },
        },
      },
    });

    if (existingUserWithRoles) {
      const conflictingActiveRole = existingUserWithRoles.userRoles.find(
        (userRole) => userRole.isActive && userRole.role !== role,
      );
      if (conflictingActiveRole) {
        this.logger.warn(
          `Role conflict for phone number: ${phoneNumber}. User has active role: ${conflictingActiveRole.role}, Requested: ${role}`,
        );
        throw new ConflictException(
          `Phone number already registered with a different active role (${conflictingActiveRole.role}).`,
        );
      }
    }

    const otpCode = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await this.prisma.phoneOtp.deleteMany({
        where: { phoneNumber: phoneNumber },
      });
      this.logger.log(`Deleted existing OTPs for phone: ${phoneNumber}`);

      const otpRecord = await this.prisma.phoneOtp.create({
        data: {
          phoneNumber: phoneNumber,
          otp: otpCode,
          expiresAt: expiresAt,
          role: role,
        },
      });

      try {
        await this.smsService.sendOtp(phoneNumber, otpCode);
        this.logger.log(
          `OTP sent (via ${this.smsService.constructor.name}) to ${phoneNumber}. Expires at ${expiresAt}.`,
        );
      } catch (smsError) {
        this.logger.error(
          `Failed to send OTP via ${this.smsService.constructor.name} to ${phoneNumber}: ${smsError.message}`,
          smsError.stack,
        );
      }

      return otpRecord;
    } catch (error) {
      this.logger.error(
        `Failed to store/send OTP for ${phoneNumber}: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          `Database error during OTP creation/cleanup. Code: ${error.code}`,
        );
      }
      throw new InternalServerErrorException('Failed to process OTP request.');
    }
  }

  private async createProfileForNewUser(
    userId: string,
    role: Role,
  ): Promise<ClientProfile | LawyerProfile> {
    this.logger.log(
      `Creating profile for new user ${userId} with role ${role}`,
    );
    if (role === Role.CLIENT) {
      return this.prisma.clientProfile.create({
        data: { userId },
      });
    } else if (role === Role.LAWYER) {
      return this.prisma.lawyerProfile.create({
        data: { userId },
      });
    } else {
      this.logger.error(`Cannot create profile for unexpected role: ${role}`);
      throw new InternalServerErrorException(
        'Invalid role for profile creation.',
      );
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string | null;
      phoneNumber: string | null;
      roles: string[];
      profileId: string;
      isNewUser: boolean;
    };
  }> {
    const { phoneNumber, otp } = verifyOtpDto;
    this.logger.log(`OTP verification attempt for phone: ${phoneNumber}`);

    // 1. Find the OTP record
    const otpRecord = await this.prisma.phoneOtp.findFirst({
      where: {
        phoneNumber: phoneNumber,
        otp: otp,
        expiresAt: { gt: new Date() }, // Check if not expired
      },
    });

    if (!otpRecord) {
      this.logger.warn(`Invalid or expired OTP for phone: ${phoneNumber}`);
      // Optionally delete expired OTPs here or rely on the scheduled job
      await this.prisma.phoneOtp.deleteMany({
        where: { phoneNumber: phoneNumber, expiresAt: { lte: new Date() } },
      });
      throw new UnauthorizedException('Invalid or expired OTP.');
    }

    // OTP is valid, proceed with login/registration
    const requestedRole = otpRecord.role; // Get the role from the OTP record

    let isNewUser = false;

    try {
      // Use transaction for atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Find or create user
        const existingUser = await tx.user.findUnique({
          where: { phoneNumber: phoneNumber },
          include: {
            userRoles: true,
            clientProfile: true,
            lawyerProfile: true,
          },
        });

        let user = existingUser;
        if (!user) {
          isNewUser = true;
          this.logger.log(`New user registration for phone: ${phoneNumber}`);

          // Create new user
          user = await tx.user.create({
            data: {
              phoneNumber: phoneNumber,
              accountStatus: AccountStatus.ACTIVE,
            },
            include: {
              userRoles: true,
              clientProfile: true,
              lawyerProfile: true,
            },
          });

          // Create role based on request or default to CLIENT
          const role = requestedRole || Role.CLIENT;
          await tx.userRole.create({
            data: {
              userId: user.id,
              role: role,
              isActive: true,
            },
          });

          // Create appropriate profile based on role
          if (role === Role.CLIENT) {
            await tx.clientProfile.create({
              data: {
                userId: user.id,
                registrationPending: true,
              },
            });
          } else if (role === Role.LAWYER) {
            await tx.lawyerProfile.create({
              data: {
                userId: user.id,
                registrationPending: true,
              },
            });
          }
        } else {
          this.logger.log(`Existing user login for phone: ${phoneNumber}`);
          // If role is provided, check if user has it
          if (requestedRole) {
            const hasRequestedRole = user.userRoles.some(
              (ur) => ur.role === requestedRole && ur.isActive,
            );
            if (!hasRequestedRole) {
              throw new UnauthorizedException(
                'User does not have the requested role',
              );
            }
          }
          // Update last login time for existing user
          await tx.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });
        }

        // Fetch the final user state with updated roles
        const finalUser = await tx.user.findUniqueOrThrow({
          where: { id: user.id },
          include: {
            userRoles: { where: { isActive: true } },
            clientProfile: true,
            lawyerProfile: true,
          },
        });

        return { user: finalUser };
      });

      const { user: finalUser } = result;

      // Create JWT payload
      const activeRoles = finalUser.userRoles.map((ur) => ur.role);
      const profileId =
        finalUser.clientProfile?.id || finalUser.lawyerProfile?.id || '';

      const payload: JwtPayload = {
        sub: finalUser.id,
        phoneNumber: finalUser.phoneNumber || undefined,
        roles: activeRoles,
        profileId,
      };

      // Generate tokens
      const tokens = await this.generateTokens(payload);

      // Store refresh token
      const hashedRefreshToken = await this.hashRefreshToken(
        tokens.refreshToken,
      );
      const refreshTokenExpiry = this.calculateRefreshTokenExpiry();

      await this.prisma.refreshToken.create({
        data: {
          hashedToken: hashedRefreshToken,
          userId: finalUser.id,
          expiresAt: refreshTokenExpiry,
        },
      });

      this.logger.log(
        `User ${finalUser.id} successfully verified/logged in with roles: ${activeRoles.join(', ')}`,
      );

      return {
        ...tokens,
        user: {
          id: finalUser.id,
          email: finalUser.email,
          phoneNumber: finalUser.phoneNumber,
          roles: activeRoles,
          profileId,
          isNewUser,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error during OTP verification/user processing for ${phoneNumber}: ${error.message}`,
        error.stack,
      );
      // Handle potential Prisma transaction errors or other exceptions
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if necessary
        throw new InternalServerErrorException(
          'Database error during verification.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred during the verification process.',
      );
    }
  }

  /**
   * Refreshes the access and refresh tokens using a valid refresh token.
   * Validates the refresh token against the database.
   * Invalidates the old refresh token and stores the new one.
   * @param refreshTokenDto - DTO containing the refresh token.
   * @returns A promise resolving to new access and refresh tokens.
   * @throws UnauthorizedException if the refresh token is invalid, expired, or not found.
   * @throws InternalServerErrorException for other errors.
   */
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log('Received refresh token request');
    const incomingRefreshToken = refreshTokenDto.refreshToken;

    try {
      // 1. Verify the JWT signature and extract payload (without checking expiry yet)
      const payload = this.jwtService.verify(incomingRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        ignoreExpiration: true, // We'll check expiry against the DB record
      }) as RefreshTokenPayload;

      if (!payload || !payload.sub) {
        this.logger.error('Invalid refresh token payload structure.');
        throw new UnauthorizedException('Invalid refresh token payload.');
      }

      const userId = payload.sub;
      this.logger.debug(
        `Refresh token payload validated for user ID: ${userId}`,
      );

      // 2. Find the stored refresh token record in the database
      const storedTokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          userId: userId,
          // We need to compare hashes, not the raw token
        },
        orderBy: {
          createdAt: 'desc', // Get the latest token if multiple exist (shouldn't happen ideally)
        },
      });

      if (!storedTokenRecord) {
        this.logger.warn(
          `No stored refresh token found for user ID: ${userId}. Possible revoked token usage.`,
        );
        throw new UnauthorizedException('Refresh token not found or revoked.');
      }

      // 3. Compare the incoming token hash with the stored hash
      const isMatch = await bcrypt.compare(
        incomingRefreshToken,
        storedTokenRecord.hashedToken,
      );

      if (!isMatch) {
        this.logger.warn(
          `Incoming refresh token does not match stored hash for user ID: ${userId}.`,
        );
        // Optional: Consider deleting all tokens for this user as a security measure
        // await this.prisma.refreshToken.deleteMany({ where: { userId: userId } });
        throw new UnauthorizedException('Invalid refresh token.');
      }

      // 4. Check if the stored token record is expired
      if (storedTokenRecord.expiresAt < new Date()) {
        this.logger.warn(
          `Stored refresh token record expired for user ID: ${userId}. Expiry: ${storedTokenRecord.expiresAt}`,
        );
        // Clean up the expired token
        await this.prisma.refreshToken.delete({
          where: { id: storedTokenRecord.id },
        });
        throw new UnauthorizedException('Refresh token expired.');
      }

      // 5. Get the user details for the new access token payload
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: { where: { isActive: true }, select: { role: true } },
          clientProfile: { select: { id: true } }, // Select only needed fields
          lawyerProfile: { select: { id: true } }, // Select only needed fields
        },
      });

      if (!user) {
        // This case should be rare if the refresh token was valid
        this.logger.error(
          `User ${userId} associated with valid refresh token not found.`,
        );
        // Invalidate the token as the user doesn't exist
        await this.prisma.refreshToken.delete({
          where: { id: storedTokenRecord.id },
        });
        throw new UnauthorizedException(
          'User associated with token not found.',
        );
      }

      // 6. Generate new access and refresh tokens
      const newAccessTokenPayload: JwtPayload = {
        sub: user.id,
        phoneNumber: user.phoneNumber || undefined,
        email: user.email || undefined,
        roles: user.userRoles.map((ur) => ur.role),
        profileId: user.clientProfile?.id || user.lawyerProfile?.id || '',
      };
      const newTokens = await this.generateTokens(newAccessTokenPayload);

      // 7. Hash the new refresh token
      const newHashedRefreshToken = await this.hashRefreshToken(
        newTokens.refreshToken,
      );
      const newRefreshTokenExpiry = this.calculateRefreshTokenExpiry();

      // 8. Atomically delete the old token and create the new one
      await this.prisma.$transaction([
        this.prisma.refreshToken.delete({
          where: { id: storedTokenRecord.id },
        }),
        this.prisma.refreshToken.create({
          data: {
            userId: userId,
            hashedToken: newHashedRefreshToken,
            expiresAt: newRefreshTokenExpiry,
          },
        }),
      ]);

      this.logger.log(`Successfully refreshed tokens for user ID: ${userId}`);
      return newTokens;
    } catch (error) {
      // Catch specific errors like JWT verification errors
      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw known auth errors
      }
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        this.logger.error(
          'JWT verification failed during refresh:',
          error.message,
        );
        throw new UnauthorizedException(
          'Invalid refresh token signature or format.',
        );
      }
      this.logger.error('Unexpected error refreshing token:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while refreshing the token.',
      );
    }
  }

  // --- Add Logout Method ---
  /**
   * Logs out a user by invalidating their refresh tokens.
   * @param userId - The ID of the user to log out.
   */
  async logout(userId: string): Promise<void> {
    this.logger.log(`Attempting to log out user ID: ${userId}`);
    try {
      // Delete all refresh tokens associated with the user
      const { count } = await this.prisma.refreshToken.deleteMany({
        where: { userId: userId },
      });
      this.logger.log(`Deleted ${count} refresh tokens for user ID: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error logging out user ID ${userId}: ${error.message}`,
        error.stack,
      );
      // Avoid throwing an error to the client on logout failure, just log it
      // throw new InternalServerErrorException('Could not process logout.');
    }
  }
  // --- End Logout Method ---

  // Function-level comment: Adds a specified role (CLIENT or LAWYER) to an existing user.
  async addRole(
    userId: string,
    addRoleDto: AddRoleDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { role } = addRoleDto;

    // Validate that the role is either CLIENT or LAWYER (already done by DTO, but good practice)
    if (role !== Role.CLIENT && role !== Role.LAWYER) {
      this.logger.warn(
        `Attempt to add invalid role (${role}) for user ${userId}`,
      );
      throw new ConflictException(
        'Invalid role specified. Can only add CLIENT or LAWYER.',
      );
    }

    this.logger.log(`Attempting to add role ${role} for user ID: ${userId}`);

    // Use a transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Find the user and their existing roles
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: true,
          clientProfile: true, // Include profiles to check existence
          lawyerProfile: true,
        },
      });

      if (!user) {
        this.logger.error(`User not found with ID: ${userId} during addRole`);
        throw new NotFoundException('User not found.');
      }

      // 2. Check if the user already has the requested role active
      const existingActiveRole = user.userRoles.find(
        (ur) => ur.role === role && ur.isActive,
      );
      if (existingActiveRole) {
        this.logger.warn(
          `User ${userId} already has active role ${role}. Cannot add again.`,
        );
        throw new ConflictException(
          `User already has the ${role} role active.`,
        );
      }

      // 3. Check if the user has the role but inactive -> activate it
      const existingInactiveRole = user.userRoles.find(
        (ur) => ur.role === role && !ur.isActive,
      );

      let profileId: string | null = null;

      if (existingInactiveRole) {
        this.logger.log(
          `Activating existing inactive role ${role} for user ${userId}`,
        );
        await tx.userRole.update({
          where: { id: existingInactiveRole.id },
          data: { isActive: true },
        });
        // Get the corresponding profile ID
        profileId =
          role === Role.CLIENT
            ? (user.clientProfile?.id ?? null)
            : (user.lawyerProfile?.id ?? null);
      } else {
        // 4. Add the new role and create the corresponding profile if it doesn't exist
        this.logger.log(`Adding new role ${role} for user ${userId}`);
        await tx.userRole.create({
          data: {
            userId: userId,
            role: role,
            isActive: true,
          },
        });

        // Create profile only if it doesn't exist
        if (role === Role.CLIENT && !user.clientProfile) {
          const clientProfile = await tx.clientProfile.create({
            data: {
              userId: user.id,
              registrationPending: true,
            },
          });
          profileId = clientProfile.id;
          this.logger.log(`Created ClientProfile for user ${userId}`);
        } else if (role === Role.LAWYER && !user.lawyerProfile) {
          const lawyerProfile = await tx.lawyerProfile.create({
            data: { userId },
          });
          profileId = lawyerProfile.id;
          this.logger.log(`Created LawyerProfile for user ${userId}`);
        } else {
          // Profile already exists, get its ID
          profileId =
            role === Role.CLIENT
              ? (user.clientProfile?.id ?? null)
              : (user.lawyerProfile?.id ?? null);
        }
      }

      if (!profileId) {
        // This should ideally not happen if logic is correct
        this.logger.error(
          `Failed to determine profileId for user ${userId} after adding role ${role}`,
        );
        throw new InternalServerErrorException(
          'Could not determine profile ID after role update.',
        );
      }

      // 5. Fetch all *active* roles for the new token payload
      const updatedActiveRoles = await tx.userRole.findMany({
        where: { userId: userId, isActive: true },
        select: { role: true },
      });
      const activeRolesEnum = updatedActiveRoles.map((ur) => ur.role);

      // 6. Generate new tokens with updated roles and the *correct* profileId for the added role
      const payload: JwtPayload = {
        sub: userId,
        phoneNumber: user.phoneNumber || undefined,
        roles: activeRolesEnum,
        profileId: profileId,
      };
      const tokens = await this.generateTokens(payload);

      // 7. Store the new refresh token hash
      const hashedRefreshToken = await this.hashRefreshToken(
        tokens.refreshToken,
      );
      const refreshTokenExpiry = this.calculateRefreshTokenExpiry();

      // Delete old refresh tokens before adding the new one
      await tx.refreshToken.deleteMany({ where: { userId: userId } });
      await tx.refreshToken.create({
        data: {
          userId: userId,
          hashedToken: hashedRefreshToken,
          expiresAt: refreshTokenExpiry,
        },
      });

      this.logger.log(
        `Successfully added/activated role ${role} for user ${userId}. New tokens generated.`,
      );
      return tokens; // Return tokens from the transaction
    });

    return result;
  }

  // --- Add Role Management Method ---
  /**
   * Updates the roles assigned to a specific user.
   * This operation is typically restricted to administrators.
   * @param userId - The ID of the user whose roles are to be updated.
   * @param updateUserRolesDto - DTO containing the new list of roles.
   * @returns The updated user object with their roles.
   */
  async updateUserRoles(
    userId: string,
    updateUserRolesDto: UpdateUserRolesDto,
  ): Promise<any> {
    // TODO: Refine return type if needed after fixing syntax errors
    this.logger.log(`Attempting to update roles for user ID: ${userId}`);
    const { roles } = updateUserRolesDto;

    // 1. Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: true }, // Include current roles
    });

    if (!user) {
      this.logger.warn(`User not found for role update: ${userId}`);
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // 2. Use a transaction to ensure atomicity
    try {
      const updatedUser = await this.prisma.$transaction(async (tx) => {
        // a. Deactivate all existing roles for the user
        await tx.userRole.updateMany({
          where: { userId: userId },
          data: { isActive: false },
        });
        this.logger.debug(`Deactivated existing roles for user: ${userId}`);

        // b. Create or reactivate the new roles
        for (const role of roles) {
          await tx.userRole.upsert({
            where: {
              userId_role: {
                // Use the compound unique index
                userId: userId,
                role: role,
              },
            },
            update: { isActive: true }, // Reactivate if it exists
            create: {
              userId: userId,
              role: role,
              isActive: true,
            },
          });
        }
        this.logger.debug(
          `Upserted new roles [${roles.join(', ')}] for user: ${userId}`,
        );

        // c. Fetch the updated user with active roles
        const result = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          include: {
            userRoles: {
              where: { isActive: true }, // Only include active roles
            },
          },
        });
        return result;
      });

      this.logger.log(`Successfully updated roles for user ID: ${userId}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Error updating roles for user ID ${userId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if necessary
      }
      throw new InternalServerErrorException('Could not update user roles.');
    }
  }
  // --- End Role Management Method ---

  // --- Scheduled Tasks ---

  /**
   * Handles daily cleanup of expired OTP records
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOtpCleanup(): Promise<void> {
    this.logger.log('Running scheduled OTP cleanup');
    try {
      const now = new Date();
      const result = await this.prisma.phoneOtp.deleteMany({
        where: { expiresAt: { lt: now } },
      });
      this.logger.log(`Cleaned up ${result.count} expired OTP records`);
    } catch (error) {
      this.logger.error(`Failed to clean up OTPs: ${error.message}`);
    }
  }

  /**
   * Clean up expired OTPs
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredOtps(): Promise<void> {
    try {
      const now = new Date();
      const result = await this.prisma.emailOtp.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: now } }, { isUsed: true }],
        },
      });
      this.logger.log(`Cleaned up ${result.count} expired or used OTPs`);
    } catch (error) {
      this.logger.error(`Error cleaning up expired OTPs: ${error.message}`);
    }
  }

  /**
   * Generates and sends an OTP via email
   * @param dto EmailOtpRequestDto containing the email
   * @returns Promise<boolean> Whether the OTP was sent successfully
   */
  async requestEmailOtp(dto: EmailOtpRequestDto): Promise<boolean> {
    // Validate email domain
    this.validateEmailDomain(dto.email);

    // Check rate limit
    this.checkRateLimit(dto.email);

    const otp = this.generateOtp();
    const expiresAt = addMinutes(new Date(), 5);

    try {
      // Save OTP to database
      await this.prisma.emailOtp.upsert({
        where: { email: dto.email },
        update: { otp, expiresAt, isUsed: false },
        create: { email: dto.email, otp, expiresAt },
      });

      // Send OTP via email
      return await this.resendService.sendOtpEmail(dto.email, otp);
    } catch (error) {
      this.logger.error(`Error requesting email OTP: ${error.message}`);
      return false;
    }
  }

  async verifyEmailOtp(dto: EmailOtpVerifyDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string | null;
      phoneNumber: string | null;
      roles: string[];
      profileId: string;
      isNewUser: boolean;
    };
  }> {
    const emailOtp = await this.prisma.emailOtp.findUnique({
      where: { email: dto.email },
    });

    if (
      !emailOtp ||
      emailOtp.otp !== dto.otp ||
      emailOtp.isUsed ||
      emailOtp.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    try {
      // Use transaction for atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Mark OTP as used
        await tx.emailOtp.update({
          where: { id: emailOtp.id },
          data: { isUsed: true },
        });

        // Find or create user
        const existingUser = await tx.user.findUnique({
          where: { email: dto.email },
          include: {
            userRoles: true,
            clientProfile: true,
            lawyerProfile: true,
          },
        });

        let user = existingUser;
        let isNewUser = false;
        if (!user) {
          isNewUser = true;
          this.logger.log(`New user registration for email: ${dto.email}`);

          // Create new user
          user = await tx.user.create({
            data: {
              email: dto.email,
              accountStatus: AccountStatus.ACTIVE,
            },
            include: {
              userRoles: true,
              clientProfile: true,
              lawyerProfile: true,
            },
          });

          // Create role based on request or default to CLIENT
          const role = dto.role || Role.CLIENT;
          await tx.userRole.create({
            data: {
              userId: user.id,
              role: role,
              isActive: true,
            },
          });

          // Create appropriate profile based on role
          if (role === Role.CLIENT) {
            await tx.clientProfile.create({
              data: {
                userId: user.id,
                registrationPending: true,
              },
            });
          } else if (role === Role.LAWYER) {
            await tx.lawyerProfile.create({
              data: {
                userId: user.id,
                registrationPending: true,
              },
            });
          }
        } else {
          this.logger.log(`Existing user login for email: ${dto.email}`);
          // If role is provided, check if user has it
          if (dto.role) {
            const hasRequestedRole = user.userRoles.some(
              (ur) => ur.role === dto.role && ur.isActive,
            );
            if (!hasRequestedRole) {
              throw new UnauthorizedException(
                'User does not have the requested role',
              );
            }
          }
          // Update last login time for existing user
          await tx.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });
        }

        // Fetch the final user state with updated roles
        const finalUser = await tx.user.findUniqueOrThrow({
          where: { id: user.id },
          include: {
            userRoles: { where: { isActive: true } },
            clientProfile: true,
            lawyerProfile: true,
          },
        });

        return { user: finalUser, isNewUser };
      });

      const { user: finalUser, isNewUser } = result;

      // Create JWT payload
      const activeRoles = finalUser.userRoles.map((ur) => ur.role);
      const profileId =
        finalUser.clientProfile?.id || finalUser.lawyerProfile?.id || '';

      const payload: JwtPayload = {
        sub: finalUser.id,
        email: finalUser.email || undefined,
        roles: activeRoles,
        profileId,
      };

      // Generate tokens
      const tokens = await this.generateTokens(payload);

      // Store refresh token
      const hashedRefreshToken = await this.hashRefreshToken(
        tokens.refreshToken,
      );
      const refreshTokenExpiry = this.calculateRefreshTokenExpiry();

      await this.prisma.refreshToken.create({
        data: {
          hashedToken: hashedRefreshToken,
          userId: finalUser.id,
          expiresAt: refreshTokenExpiry,
        },
      });

      this.logger.log(
        `User ${finalUser.id} successfully verified/logged in with roles: ${activeRoles.join(', ')}`,
      );

      return {
        ...tokens,
        user: {
          id: finalUser.id,
          email: finalUser.email,
          phoneNumber: finalUser.phoneNumber,
          roles: activeRoles,
          profileId,
          isNewUser,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error during email OTP verification for ${dto.email}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred during the verification process.',
      );
    }
  }

  /**
   * Unified OTP request handler for both email and phone
   * @param dto UnifiedOtpRequestDto containing either email or phoneNumber
   * @returns Promise<boolean> Whether the OTP was sent successfully
   */
  async requestUnifiedOtp(dto: UnifiedOtpRequestDto): Promise<boolean> {
    if (dto.email) {
      return this.requestEmailOtp({ email: dto.email });
    } else if (dto.phoneNumber) {
      const result = await this.requestOtp({
        phoneNumber: dto.phoneNumber,
        role: Role.CLIENT,
      });
      return !!result; // Convert Otp object to boolean
    }
    throw new UnauthorizedException(
      'Either email or phoneNumber must be provided',
    );
  }

  async verifyUnifiedOtp(dto: UnifiedOtpVerifyDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string | null;
      phoneNumber: string | null;
      roles: string[];
      profileId: string;
      isNewUser: boolean;
    };
  }> {
    if (dto.email) {
      return this.verifyEmailOtp({
        email: dto.email,
        otp: dto.otp,
        role: dto.role,
      });
    } else if (dto.phoneNumber) {
      return this.verifyOtp({ phoneNumber: dto.phoneNumber, otp: dto.otp });
    }
    throw new UnauthorizedException(
      'Either email or phoneNumber must be provided',
    );
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        accountStatus: true,
        userRoles: {
          where: { isActive: true },
          select: { role: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Transform the response to match the expected format
    const { userRoles, ...userData } = user;
    return {
      ...userData,
      roles: userRoles.map((ur) => ur.role),
    };
  }
} // End of AuthService class
