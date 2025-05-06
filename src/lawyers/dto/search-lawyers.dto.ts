import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { PracticeArea } from '@prisma/client';

// Define the PracticeArea enum values for Swagger documentation
const PracticeAreaEnum = {
  CORPORATE: 'CORPORATE',
  FAMILY: 'FAMILY',
  CRIMINAL: 'CRIMINAL',
  CIVIL: 'CIVIL',
  LABOR: 'LABOR',
  TAX: 'TAX',
  INTELLECTUAL_PROPERTY: 'INTELLECTUAL_PROPERTY',
  REAL_ESTATE: 'REAL_ESTATE',
  IMMIGRATION: 'IMMIGRATION',
  BANKRUPTCY: 'BANKRUPTCY',
  ENVIRONMENTAL: 'ENVIRONMENTAL',
  HEALTHCARE: 'HEALTHCARE',
  CONSUMER_PROTECTION: 'CONSUMER_PROTECTION',
  CYBER_LAW: 'CYBER_LAW',
  INTERNATIONAL: 'INTERNATIONAL',
  OTHER: 'OTHER',
} as const;

/**
 * DTO for searching lawyers with various filters
 */
export class SearchLawyersDto {
  @ApiProperty({
    description: 'Search term to filter lawyers by name or bio',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({
    description: 'Practice area to filter lawyers by',
    required: false,
  })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiProperty({
    description: 'Court to filter lawyers by',
    required: false,
  })
  @IsOptional()
  @IsString()
  court?: string;

  @ApiProperty({
    description: 'Service to filter lawyers by',
    required: false,
  })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiProperty({
    description: 'Minimum hourly rate to filter lawyers by',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minHourlyRate?: number;

  @ApiProperty({
    description: 'Maximum hourly rate to filter lawyers by',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxHourlyRate?: number;

  @ApiProperty({
    description: 'Minimum rating to filter lawyers by (0-5)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page (max: 100)',
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
