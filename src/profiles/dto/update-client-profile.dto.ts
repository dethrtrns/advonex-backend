import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ClientProfile } from '@prisma/client';

/**
 * DTO for updating a client's profile.
 * All fields are optional and match the Prisma schema exactly.
 */
export class UpdateClientProfileDto implements Partial<ClientProfile> {
  @ApiPropertyOptional({
    description: "Client's full name",
    example: 'John Doe',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string | null;

  @ApiPropertyOptional({
    description:
      "URL of the client's profile picture. Send empty string or null to remove.",
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  photo?: string | null;

  @ApiPropertyOptional({
    description: 'Whether registration is pending',
    default: true,
  })
  @IsOptional()
  registrationPending?: boolean;
}
