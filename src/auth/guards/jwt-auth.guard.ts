import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

// Class-level comment: Implements the JWT authentication guard using Passport's 'jwt' strategy.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { // Specify the 'jwt' strategy

  // Function-level comment: Determines if the current request is allowed to proceed.
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Add custom authentication logic here if needed before calling super.canActivate()
    // For example, checking for revoked tokens against a cache/database.
    return super.canActivate(context);
  }

  // Function-level comment: Handles the result of the authentication attempt.
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      // Log the specific error/info for debugging if needed
      // console.error('JWT Auth Error:', err, 'Info:', info);
      throw err || new UnauthorizedException(info?.message || 'Authentication required.');
    }
    // If authentication is successful, Passport attaches the user to the request object
    return user;
  }
}