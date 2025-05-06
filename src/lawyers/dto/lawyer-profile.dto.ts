import { ApiProperty } from '@nestjs/swagger';
import {
  LawyerProfile,
  PracticeArea,
  PracticeCourt,
  Service,
  Education,
} from '@prisma/client';

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
 * DTO for public lawyer profile response
 */
export class LawyerProfileDto {
  @ApiProperty({
    description: 'Unique identifier of the lawyer profile',
    type: 'string',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the lawyer',
    type: 'string',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: 'Email address of the lawyer',
    type: 'string',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Profile photo URL of the lawyer',
    type: 'string',
    nullable: true,
  })
  photo: string | null;

  @ApiProperty({
    description: 'Location of the lawyer',
    type: 'string',
    nullable: true,
  })
  location: string | null;

  @ApiProperty({
    description: 'Years of experience',
    type: 'number',
    nullable: true,
  })
  experience: number | null;

  @ApiProperty({
    description: 'Bio or description of the lawyer',
    type: 'string',
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({
    description: 'Consultation fee',
    type: 'number',
    nullable: true,
  })
  consultFee: number | null;

  @ApiProperty({
    description: 'Bar registration ID',
    type: 'string',
    nullable: true,
  })
  barId: string | null;

  @ApiProperty({
    description: 'Whether the lawyer is verified',
    type: 'boolean',
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Whether registration is pending',
    type: 'boolean',
  })
  registrationPending: boolean;

  @ApiProperty({
    description: 'Primary specialization',
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      description: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
  })
  specialization: PracticeArea | null;

  @ApiProperty({
    description: 'Primary court',
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      location: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
  })
  primaryCourt: PracticeCourt | null;

  @ApiProperty({
    description: 'Practice areas',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        practiceArea: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  practiceAreas: Array<{ practiceArea: PracticeArea }>;

  @ApiProperty({
    description: 'Practice courts',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        practiceCourt: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  practiceCourts: Array<{ practiceCourt: PracticeCourt }>;

  @ApiProperty({
    description: 'Services offered',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        service: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  services: Array<{ service: Service }>;

  @ApiProperty({
    description: 'Education details',
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'string', format: 'uuid' },
      degree: { type: 'string' },
      institution: { type: 'string' },
      year: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
  })
  education: Education | null;

  @ApiProperty({
    description: 'Creation timestamp',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

/**
 * Base response DTO for all API responses
 */
export class BaseResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    type: 'boolean',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    type: 'string',
    example: 'Operation completed successfully',
  })
  message: string;
}

/**
 * Response wrapper for paginated lawyer profiles
 */
export class PaginatedLawyerProfilesResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Array of lawyer profiles',
    type: [LawyerProfileDto],
  })
  data: LawyerProfileDto[];

  @ApiProperty({
    description: 'Current page number',
    type: 'number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    type: 'number',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    type: 'number',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    type: 'number',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    type: 'boolean',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    type: 'boolean',
    example: false,
  })
  hasPreviousPage: boolean;
}
