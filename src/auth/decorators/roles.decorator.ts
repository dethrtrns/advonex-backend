import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// Define a key for storing roles metadata
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are required to access a specific route.
 * Attaches an array of roles to the route handler's metadata.
 *
 * @param roles - An array of Role enums required for access.
 * @example @Roles(Role.LAWYER, Role.ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);