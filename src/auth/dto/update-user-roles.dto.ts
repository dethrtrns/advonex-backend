import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

/**
 * Defines the structure and validation rules for updating a user's roles.
 */
export class UpdateUserRolesDto {
  @ApiProperty({
    description: 'An array of roles to assign to the user.',
    enum: Role,
    isArray: true,
    example: [Role.CLIENT, Role.LAWYER],
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  @IsNotEmpty({ each: true })
  roles: Role[];
}
