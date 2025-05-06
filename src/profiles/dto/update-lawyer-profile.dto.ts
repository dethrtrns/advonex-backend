import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsUrl,
  IsUUID,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { LawyerProfile } from '@prisma/client';

/**
 * DTO for updating a lawyer's profile.
 * All fields are optional and match the Prisma schema exactly.
 * For relational fields, frontend can send either the ID or the name string.
 */
export class UpdateLawyerProfileDto implements Partial<LawyerProfile> {
  @ApiPropertyOptional({
    description: "Lawyer's name",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string | null;

  @ApiPropertyOptional({
    description: "Lawyer's profile photo URL",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  photo?: string | null;

  @ApiPropertyOptional({
    description: "Lawyer's location",
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string | null;

  @ApiPropertyOptional({
    description: 'Years of professional experience',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  experience?: number | null;

  @ApiPropertyOptional({
    description: "Lawyer's professional biography",
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string | null;

  @ApiPropertyOptional({
    description: 'Consultation fee',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  consultFee?: number | null;

  @ApiPropertyOptional({
    description: 'Bar registration number',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barId?: string | null;

  @ApiPropertyOptional({
    description: 'Whether the lawyer is verified',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Whether registration is pending',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  registrationPending?: boolean;

  @ApiPropertyOptional({
    description: 'Primary specialization ID or name',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Primary court ID or name',
  })
  @IsOptional()
  @IsString()
  primaryCourt?: string;

  @ApiPropertyOptional({
    description: 'Education details',
    type: 'object',
    properties: {
      degree: { type: 'string' },
      institution: { type: 'string' },
      year: { type: 'number' },
    },
  })
  @IsOptional()
  education?: {
    degree: string;
    institution: string;
    year: number;
  };
}
