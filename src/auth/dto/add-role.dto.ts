import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for adding a role to a user.
 */
export class AddRoleDto {
  /**
   * The role to add to the user.
   * Must be either CLIENT or LAWYER.
   * @example Role.CLIENT
   */
  @ApiProperty({
    description: 'The role to add (CLIENT or LAWYER)',
    enum: Role,
    example: Role.CLIENT,
  })
  @IsNotEmpty()
  @IsEnum(Role, {
    message: `Role must be either ${Role.CLIENT} or ${Role.LAWYER}`,
  })
  role: Role;
}
