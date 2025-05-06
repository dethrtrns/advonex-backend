import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, AccountStatus } from '@prisma/client'; // Import Role

// Interface defining the structure of the JWT payload after validation
export interface JwtPayload {
  sub: string; // User ID
  phoneNumber?: string; // Optional for email-based users
  email?: string; // Optional for phone-based users
  roles: Role[]; // Array of roles
  profileId: string; // ID of the active profile (Client or Lawyer)
  // status?: AccountStatus; // Optional: Include if needed for checks
}

// Class-level comment: Strategy for validating JWT access tokens.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  // Specify 'jwt' as the default name
  private readonly logger = new Logger(JwtStrategy.name);

  // Constructor-level comment: Injects necessary services.
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Retrieve the secret first
    const secret = configService.get<string>('JWT_SECRET');

    // Validate the secret before calling super()
    if (!secret) {
      const errorMessage =
        'JWT_SECRET is not defined in environment variables.';
      // Log the error before throwing
      new Logger(JwtStrategy.name).error(errorMessage);
      // Throw an error to prevent strategy initialization with invalid config
      throw new Error(`Server configuration error: ${errorMessage}`);
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Ensure expired tokens are rejected
      // Pass the validated secret (now guaranteed to be a string)
      secretOrKey: secret,
    });
    this.logger.log('JwtStrategy initialized');
  }

  // Function-level comment: Validates the JWT payload and fetches user details.
  async validate(payload: JwtPayload): Promise<any> {
    // Return type can be more specific if needed, e.g., User & roles
    this.logger.debug(`Validating JWT payload for user ID: ${payload.sub}`);
    // The payload is already verified by Passport strategy by this point
    // We can trust its contents based on the secret used for signing

    // Optional: Fetch user from DB to ensure they still exist and are active
    // This adds a DB query per request but increases security
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      // Include roles if needed, though they are already in the payload
      // include: { userRoles: { where: { isActive: true }, select: { role: true } } }
    });

    if (!user) {
      this.logger.warn(`User from JWT payload not found in DB: ${payload.sub}`);
      throw new UnauthorizedException('User not found.');
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      this.logger.warn(
        `User from JWT payload is not active: ${payload.sub}, Status: ${user.accountStatus}`,
      );
      throw new UnauthorizedException(
        `User account is ${user.accountStatus.toLowerCase()}.`,
      );
    }

    // Return the validated payload (or a custom user object)
    // The returned value will be attached to `req.user`
    this.logger.debug(
      `JWT payload validated successfully for user ID: ${payload.sub}`,
    );
    // Return the payload directly, which now includes the roles array
    return payload;
    // Or construct a custom object:
    // return {
    //   userId: payload.sub,
    //   phoneNumber: payload.phoneNumber,
    //   roles: payload.roles, // Pass the roles array
    //   profileId: payload.profileId,
    //   status: user.accountStatus, // Add status from DB check
    // };
  }
}
