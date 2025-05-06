import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Class-level comment: Implements an authentication guard using the 'jwt-refresh' strategy.
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  // Specify the 'jwt-refresh' strategy
  private readonly logger = new Logger(RefreshTokenGuard.name);

  // Function-level comment: Overrides the default handleRequest to provide custom error handling or logging if needed.
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): any {
    if (err || !user) {
      this.logger.warn(
        `Refresh token validation failed: ${info?.message || err?.message || 'No user found'}`,
      );
      // You can customize the error thrown or log more details here
      throw (
        err ||
        new UnauthorizedException(
          info?.message || 'Invalid or expired refresh token',
        )
      );
    }
    // If validation is successful, Passport attaches the user payload to the request object.
    this.logger.debug(`Refresh token guard passed for user ID: ${user.sub}`);
    return user; // Return the user payload (which includes the refresh token)
  }
}
