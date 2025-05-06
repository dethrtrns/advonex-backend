import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../strategies/jwt.strategy'; // Import JwtPayload

// Class-level comment: A guard to check if the authenticated user has one of the required roles.
@Injectable()
export class HasUserRoleGuard implements CanActivate {
  private readonly logger = new Logger(HasUserRoleGuard.name);

  // Constructor-level comment: Injects the Reflector service to read metadata.
  constructor(private reflector: Reflector) {}

  // Function-level comment: Determines if the current user has permission based on roles.
  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles from the @Roles() decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Method-level metadata
      context.getClass(),   // Class-level metadata
    ]);

    // If no roles are required, allow access (guard is likely applied unnecessarily or access is public)
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('No specific roles required for this route. Access granted.');
      return true;
    }

    // 2. Get the user object from the request (attached by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    // Ensure the payload structure matches what JwtStrategy returns
    const userPayload = request.user as JwtPayload; // Use JwtPayload type

    // If user is not attached (e.g., JwtAuthGuard didn't run or failed), deny access
    if (!userPayload || !userPayload.roles) {
      this.logger.warn('User payload or roles not found in request. Access denied.');
      // NestJS automatically throws ForbiddenException when returning false,
      // but throwing explicitly can provide more context if needed.
      // throw new ForbiddenException('Access Denied: User information missing.');
      return false;
    }

    this.logger.debug(`Required roles: ${requiredRoles.join(', ')}. User roles: ${userPayload.roles.join(', ')}`);

    // 3. Check if the user's roles array includes at least one of the required roles
    const hasRequiredRole = requiredRoles.some((role) =>
      userPayload.roles.includes(role),
    );

    if (!hasRequiredRole) {
      this.logger.warn(`User ID ${userPayload.sub} lacks required roles. Access denied.`);
      // Throw ForbiddenException for clarity, although returning false also works
      throw new ForbiddenException(`Access Denied: Requires one of the following roles: ${requiredRoles.join(', ')}`);
    }

    this.logger.debug(`User ID ${userPayload.sub} has required role. Access granted.`);
    return true; // User has at least one required role
  }
}