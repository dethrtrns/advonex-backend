import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'; // Import Request from express
import { JwtPayload } from './jwt.strategy'; // Reuse the same payload structure
import { PrismaService } from '../../prisma/prisma.service'; // Import PrismaService

// Interface for the payload extracted from the refresh token, including the token itself
export interface RefreshTokenPayload extends JwtPayload {
  refreshToken: string;
}

// Class-level comment: Implements Passport strategy for validating JWT refresh tokens.
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  // Use a unique name 'jwt-refresh'
  private readonly logger = new Logger(RefreshTokenStrategy.name);

  // Constructor-level comment: Injects necessary services and configures the strategy.
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // --- Edit Start ---
    // Retrieve the secret first
    const secret = configService.get<string>('JWT_REFRESH_SECRET');

    // Validate the secret before calling super()
    if (!secret) {
      const errorMessage =
        'JWT_REFRESH_SECRET is not defined in environment variables.';
      // Log the error before throwing
      new Logger(RefreshTokenStrategy.name).error(errorMessage);
      // Throw an error to prevent strategy initialization with invalid config
      throw new Error(`Server configuration error: ${errorMessage}`);
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Pass the validated secret (now guaranteed to be a string)
      secretOrKey: secret,
      // Pass the request object to the validate method
      passReqToCallback: true,
    });
    // --- Edit End ---

    this.logger.log('RefreshTokenStrategy initialized');
    // The check below is now redundant as it's handled above before super()
    // if (!configService.get<string>('JWT_REFRESH_SECRET')) {
    //   this.logger.error('JWT_REFRESH_SECRET is not defined in environment variables.');
    //   throw new Error('Server configuration error: JWT_REFRESH_SECRET is missing.');
    // }
  }

  // Function-level comment: Validates the JWT payload extracted from the refresh token.
  // It also receives the request object because passReqToCallback is true.
  async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<RefreshTokenPayload> {
    this.logger.debug(`Validating refresh token for user ID: ${payload.sub}`);

    // Extract the raw token from the header
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      this.logger.warn(
        `Refresh token missing in request for user ID: ${payload.sub}`,
      );
      throw new UnauthorizedException('Refresh token missing');
    }

    // Optional: Add a check here to see if the user still exists and is active, although
    // the main validation against the stored hashed token will happen in the AuthService.
    // const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    // if (!user || user.accountStatus !== 'ACTIVE') {
    //   this.logger.warn(`User ${payload.sub} not found or not active during refresh token validation.`);
    //   throw new UnauthorizedException('User not found or inactive');
    // }

    this.logger.debug(
      `Refresh token successfully validated for user ID: ${payload.sub}`,
    );
    // Return the original payload along with the raw refresh token
    return { ...payload, refreshToken };
  }
}
