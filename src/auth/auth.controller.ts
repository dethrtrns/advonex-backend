import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Logger,
  UseGuards,
  Req,
  Delete, // Import Delete decorator
  Put, // Import Put decorator
  Param, // Import Param decorator
  ParseUUIDPipe, // Import ParseUUIDPipe for ID validation
  UnauthorizedException, // Add missing import
  Patch, // Add missing import
  Get, // Import Get decorator
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'; // Import ApiBearerAuth, ApiParam, ApiBody
import { PhoneOtp, Role, User, UserRole } from '@prisma/client'; // Import Role, User, UserRole
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Request } from 'express'; // Import Request
import { JwtPayload } from './strategies/jwt.strategy';
import { RefreshTokenPayload } from './strategies/refresh-token.strategy';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto'; // Import DTO
import { AddRoleDto } from './dto/add-role.dto'; // Import AddRoleDto
import { Roles } from './decorators/roles.decorator'; // Import Roles decorator
import { HasUserRoleGuard as RolesGuard } from './guards/roles.guard'; // Import RolesGuard
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Ensure JwtAuthGuard is imported
import {
  EmailOtpRequestDto,
  EmailOtpVerifyDto,
  UnifiedOtpRequestDto,
  UnifiedOtpVerifyDto,
} from './dto/email-otp.dto';
// TODO:
// 1. in testing i see when i update the specialization of a lawyer via this Put request(jest sending this: {"specialization": "Technology Law"} ), then it sets the specialization successfully but nullifies the primaryCourt field, and vice versa. First find out and explain why this is happening then propose a fix and apply only after i confirm. DO NOT TRY To FIX Without finding the origin of the issue.
// 2. For practiceAreas, practiceCourts, and services (many-to-many relations), i want a similar behaviour: the frontend(or api user) if(optionally) sends the body with the field name and values as an array of object/s(each object representing data-a row of the respective table) with field and value pairs as as per the schema, and we check each value of the array for existing data in respective table and link them accordingly and for values not found in existing-we create the data and then link it properly with the profile. For example- frontend sends this request body-{"practiceAreas": [{"name":"Civil Law"}, {"name":"Family Law"}]}, so we first check if these(all values) already exist(related to) on the profile and send appropriate response, else we check if the requested practiceAreas exist in PracticeArea table, let's say we find that "Civil Law" exists but "Family Law" doesn't, so we first create the data for not existing value e.i. "Family Law", then we link the lawyer's profile to these(all requested practiceAreas in the Array) requested relations.
// For:
// A) practiceAreas: the whole field is optional but if it is sent then it must be an Array of either valid objects or empty array(an empty array should reset/remove any existing practiceAreas relation of the lawyer and set it to null). A valid object here means it must/can have:
//  1. the field- "name" : "any practice area string value"
//  2. optinal field-"id" is allowed but won't be used mandatorily, we can use this value if available to set the relations directly and skip creation process).

// Update process: If 'id' field is provided(for each object of the array) then we just update the profile with requested practiceArea(if provided id is valid else throw error and send response of invalid practiceArea id), else if no 'id' field then we check each name field's value of the object/s sent in the array to match existing data in table, else create the data not found in table. Then we update the profile with required relation/s.

// B) practiceCourts: the whole field is optional but if it is sent then it must be an Array of either valid objects or empty array(an empty array should reset/remove any existing practiceCourts relation of the lawyer and set it to null). A valid object here means it must/can have:
//  1. the field- "name" : "any practice Court string value".
//  2. optinal field-"id" is allowed but won't be used mandatorily, we can use this value if available to set the relations directly and skip creation process).
//  3. optional field-"location" is allowed and if sent then location is updated(of the respective existing practiceCourt data or the newly created data)

// Update process: If 'id' field is provided(for each object of the array) then we just update the profile with requested practiceCourt(if provided id is valid else throw error and send response of invalid court id), else if no 'id' field then we check each name field's value of the object/s sent in the array to match existing data in table, else create the data not found in table. Then we update the profile with required relation/s. For location field(if provided) we update the location of the respective(if updating the profile with existing court data via provided 'id' or found by name then we update the respective value of the PracticeCourt table with the provided location field else if creating a new one we should set the location field of the created PracticeCourt row to the location provided) PracticeCourt data in the PracticeCourt Table. In case of creating new PracticeCourt where location field/value is not provided(or is falsy) we should default the location field of the created PracticeCourt row to the location value of the lawyer's profile(it makes sense as the location field in the lawyer profile represents the city where s/he practices Law, so the PracticeCourt s/he's is selecting should logically be in same city).

// C) Services: the whole field is optional but if it is sent then it must be an Array of either valid objects or empty array(an empty array should reset/remove any existing services relation of the lawyer and set it to null). A valid object here means it must/can have:
//  1. the field- "name" : "any service string value".
//  2. optinal field-"id" is allowed but won't be used mandatorily, we can use this value if available to set the relations directly and skip creation process).
//  3. optional field-"description" is allowed and if sent then description is updated(of the respective existing service data or the newly created data)
//  4. optional field-"isPredefined", if valid boolean value provided then we set it to the provided value else default is false.

// Update process: If 'id' field is provided(for each object of the array) then we just update the profile with requested service(if provided id is valid else throw error and send response of invalid service id), else if no 'id' field then we check each name field's value of the object/s sent in the array to match existing data in table, else create the data not found in table. Then we update the profile with required relation/s. For description field(if provided) we update the description of the respective(if updating the profile with existing Service data via provided 'id' or found by name then we update the respective value of the Service table with the provided description field else if creating a new one we should set the description field of the created Service row to the description provided) Service data in the Service Table.

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // --- OTP Endpoints ---

  // @Post('request-otp')
  // @ApiOperation({
  //   summary: 'Request phone OTP',
  //   description: `
  //     Sends a 6-digit OTP to the provided phone number.
  //     Rate limited to 5 requests per hour per phone number.
  //     The OTP expires in 5 minutes.

  //     **Testing Tips:**
  //     - Use a valid phone number format
  //     - Check your SMS for the OTP
  //     - Note the OTP for verification
  //   `,
  // })
  // @ApiBody({ type: RequestOtpDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'OTP sent successfully',
  //   schema: {
  //     example: { success: true },
  //   },
  // })
  // @ApiResponse({
  //   status: HttpStatus.TOO_MANY_REQUESTS,
  //   description: 'Too many OTP requests. Please try again later.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Invalid phone number format.',
  // })
  // @HttpCode(HttpStatus.OK)
  // async requestOtp(@Body() dto: RequestOtpDto): Promise<{ success: boolean }> {
  //   await this.authService.requestOtp(dto);
  //   return { success: true };
  // }

  // @Post('verify-otp')
  // @ApiOperation({
  //   summary: 'Verify phone OTP',
  //   description: `
  //     Verifies the OTP sent to the phone number and returns JWT tokens and user info if valid.
  //     For new users, this will create a new account with the specified role.
  //     For existing users, this will log them in and return tokens.

  //     **Testing Tips:**
  //     - Use the OTP received via SMS
  //     - Tokens and user info will be returned in the response
  //     - Store the refresh token securely for future use
  //   `,
  // })
  // @ApiBody({ type: VerifyOtpDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'OTP verified successfully, tokens and user info returned.',
  //   schema: {
  //     example: {
  //       accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  //       refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  //       user: {
  //         id: '123e4567-e89b-12d3-a456-426614174000',
  //         email: 'user@example.com',
  //         phoneNumber: '+1234567890',
  //         roles: ['CLIENT'],
  //         profileId: '123e4567-e89b-12d3-a456-426614174001',
  //         isNewUser: false,
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'Invalid or expired OTP.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Invalid input data.',
  // })
  // @HttpCode(HttpStatus.OK)
  // async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{
  //   accessToken: string;
  //   refreshToken: string;
  //   user: {
  //     id: string;
  //     email: string | null;
  //     phoneNumber: string | null;
  //     roles: string[];
  //     profileId: string;
  //     isNewUser: boolean;
  //   };
  // }> {
  //   return this.authService.verifyOtp(verifyOtpDto);
  // }

  @Post('request-otp-email')
  @ApiOperation({
    summary: 'Request OTP via Email',
    description: `
      Sends a 6-digit OTP to the provided email address.
      Rate limited to 5 requests per hour per email.
      The OTP expires in 5 minutes.
      
      **Testing Tips:**
      - Use a valid email from supported domains (gmail.com, yahoo.com, outlook.com, hotmail.com)
      - Check your email inbox for the OTP
      - Note the OTP for verification
    `,
  })
  @ApiBody({ type: EmailOtpRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP sent successfully',
    schema: {
      example: { success: true },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many OTP requests. Please try again later.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email format or unsupported email domain.',
  })
  @HttpCode(HttpStatus.OK)
  async requestEmailOtp(
    @Body() dto: EmailOtpRequestDto,
  ): Promise<{ success: boolean }> {
    const data = await this.authService.requestEmailOtp(dto);
    return { success: data };
  }

  @Post('verify-otp-email')
  @ApiOperation({
    summary: 'Verify Email OTP',
    description: `
      Verifies the OTP sent to the email address and returns JWT tokens and user info if valid.
      For new users, this will create a new account with CLIENT role by default.
      For existing users, this will log them in and return tokens.
      
      **Testing Tips:**
      - Use the OTP received via email
      - Tokens and user info will be returned in the response
      - Store the refresh token securely for future use
    `,
  })
  @ApiBody({ type: EmailOtpVerifyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP verified successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          phoneNumber: '+1234567890',
          roles: ['CLIENT'],
          profileId: '123e4567-e89b-12d3-a456-426614174001',
          isNewUser: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired OTP.',
  })
  @HttpCode(HttpStatus.OK)
  async verifyEmailOtp(@Body() dto: EmailOtpVerifyDto): Promise<{
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
    const data = this.authService.verifyEmailOtp(dto);
    return data;
  }

  // @Post('request-otp')
  // @ApiOperation({
  //   summary: 'Request OTP (Unified)',
  //   description: `
  //     Unified endpoint to request OTP via either email or phone.
  //     Rate limited to 5 requests per hour per identifier.
  //     The OTP expires in 5 minutes.

  //     **Testing Tips:**
  //     - Provide either email or phone number
  //     - Check your email/SMS for the OTP
  //     - Note the OTP for verification
  //   `,
  // })
  // @ApiBody({ type: UnifiedOtpRequestDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'OTP sent successfully',
  //   schema: {
  //     example: { success: true },
  //   },
  // })
  // @ApiResponse({
  //   status: HttpStatus.TOO_MANY_REQUESTS,
  //   description: 'Too many OTP requests. Please try again later.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Invalid input data or unsupported email domain.',
  // })
  // @HttpCode(HttpStatus.OK)
  // async requestUnifiedOtp(
  //   @Body() dto: UnifiedOtpRequestDto,
  // ): Promise<{ success: boolean }> {
  //   const success = await this.authService.requestUnifiedOtp(dto);
  //   return { success };
  // }

  // @Post('verify-otp')
  // @ApiOperation({
  //   summary: 'Verify OTP (Unified)',
  //   description: `
  //     Unified endpoint to verify OTP received via either email or phone.
  //     Returns JWT tokens and user info if verification is successful.

  //     **Testing Tips:**
  //     - Use the OTP received via email/SMS
  //     - Tokens and user info will be returned in the response
  //     - Store the refresh token securely for future use
  //   `,
  // })
  // @ApiBody({ type: UnifiedOtpVerifyDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'OTP verified successfully',
  //   schema: {
  //     example: {
  //       accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  //       refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  //       user: {
  //         id: '123e4567-e89b-12d3-a456-426614174000',
  //         email: 'user@example.com',
  //         phoneNumber: '+1234567890',
  //         roles: ['CLIENT'],
  //         profileId: '123e4567-e89b-12d3-a456-426614174001',
  //         isNewUser: false,
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'Invalid or expired OTP.',
  // })
  // @HttpCode(HttpStatus.OK)
  // async verifyUnifiedOtp(@Body() dto: UnifiedOtpVerifyDto): Promise<{
  //   accessToken: string;
  //   refreshToken: string;
  //   user: {
  //     id: string;
  //     email: string | null;
  //     phoneNumber: string | null;
  //     roles: string[];
  //     profileId: string;
  //     isNewUser: boolean;
  //   };
  // }> {
  //   return this.authService.verifyUnifiedOtp(dto);
  // }

  // --- Token Endpoints ---

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({
    summary: 'Refresh access token',
    description: `
      Generates new access and refresh tokens using a valid refresh token.
      The old refresh token will be invalidated.
      
      **Testing Tips:**
      - Include refresh token in Authorization header
      - Store the new tokens securely
      - The old refresh token will no longer work
    `,
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token.',
  })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = req.headers.authorization?.split(' ')[1];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }
    return this.authService.refreshToken({ refreshToken });
  }

  // --- Add logout endpoint

  @UseGuards(JwtAuthGuard) // Protect with standard JWT guard
  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: `
      Invalidates all refresh tokens for the authenticated user.
      Requires a valid access token in the Authorization header.
      
      **Testing Tips:**
      - Include the access token in the Authorization header
      - After logout, the refresh token will no longer work
    `,
  })
  @ApiBearerAuth() // Indicate JWT bearer token is expected
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated.',
  })
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request): Promise<void> {
    const userId = (req.user as JwtPayload)?.sub; // Correct type hint
    if (!userId) {
      this.logger.error('User ID not found in JWT payload during logout');
      throw new UnauthorizedException();
    }
    this.logger.log(`Received logout request for user ID: ${userId}`);
    await this.authService.logout(userId);
  }

  // --- Role Management Endpoints ---

  // @UseGuards(JwtAuthGuard, RolesGuard) // Protect and check roles
  // @Roles(Role.ADMIN) // Only ADMINs can access this
  // @Patch('users/:userId/roles') // Use Patch decorator
  // @ApiOperation({
  //   summary: 'Update user roles (Admin only)',
  //   description: `
  //     Updates the roles assigned to a specific user.
  //     Only administrators can access this endpoint.

  //     **Testing Tips:**
  //     - Include admin access token in Authorization header
  //     - Provide valid user ID and roles
  //     - Roles must be valid enum values (CLIENT, LAWYER, ADMIN)
  //   `,
  // })
  // @ApiBearerAuth()
  // @ApiParam({
  //   name: 'userId',
  //   description: 'ID of the user to update',
  //   example: '123e4567-e89b-12d3-a456-426614174000',
  // })
  // @ApiBody({
  //   type: UpdateUserRolesDto,
  //   examples: {
  //     update: {
  //       summary: 'Update User Roles',
  //       value: {
  //         roles: ['CLIENT', 'LAWYER'],
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'User roles updated successfully.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'User not found.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Invalid input data.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.FORBIDDEN,
  //   description: 'Admin privileges required.',
  // })
  // @HttpCode(HttpStatus.OK)
  // async updateUserRoles(
  //   @Param('userId', ParseUUIDPipe) userId: string,
  //   @Body() updateUserRolesDto: UpdateUserRolesDto,
  // ): Promise<void> {
  //   this.logger.log(
  //     `Admin request to update roles for user ${userId}: ${JSON.stringify(updateUserRolesDto)}`,
  //   );
  //   await this.authService.updateUserRoles(userId, updateUserRolesDto);
  // }

  @Post('add-role')
  @UseGuards(JwtAuthGuard) // Protect this route for any authenticated user
  @ApiBearerAuth() // Indicate that this endpoint requires a bearer token
  @ApiOperation({
    summary: 'Add or activate a role for the authenticated user',
    description: `
      Adds a new role (CLIENT or LAWYER) to the currently authenticated user or activates it if it already exists but is inactive.
      If a new role is added or an existing one is activated, all other roles for the user will be set to inactive.
      The role 'ADMIN' cannot be added via this endpoint.
      Returns new access and refresh tokens upon successful operation.
    `,
  })
  @ApiBody({ type: AddRoleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role added/activated successfully. New tokens returned.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid role specified or role is missing.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Role already exists and is active for this user.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot add ADMIN role via this endpoint.',
  })
  @HttpCode(HttpStatus.OK)
  async addRoleToUser(
    @Req() req: Request, // Get the authenticated user from the request
    @Body() addRoleDto: AddRoleDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userId = (req.user as JwtPayload).sub;
    if (!userId) {
      this.logger.error('User ID not found in JWT payload for addRoleToUser');
      throw new UnauthorizedException('User not properly authenticated.');
    }
    this.logger.log(
      `User ${userId} attempting to add/activate role: ${addRoleDto.role}`,
    );

    return this.authService.addRoleForAuthenticatedUser(userId, addRoleDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user info',
    description: `
      Returns the current authenticated user's information.
      Requires a valid JWT token in the Authorization header.
      
      **Testing Tips:**
      - Include the JWT token in the Authorization header
      - Returns user's basic information (id, email, phoneNumber, roles)
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        phoneNumber: '+1234567890',
        roles: ['CLIENT'],
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z',
        lastLogin: '2024-03-20T10:00:00Z',
        accountStatus: 'ACTIVE',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: Request) {
    const user = req.user as JwtPayload;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.getUserById(user.sub);
  }
}
