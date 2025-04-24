import { ApiProperty } from '@nestjs/swagger';
import { Lawyer, Education, PracticeCourt } from '@prisma/client';

// This file contains Data Transfer Objects (DTOs) for the lawyers module
// DTOs define the shape of data that is transferred between client and server
// They also provide documentation for the API through Swagger/OpenAPI

// Use Prisma-generated types as base types for consistency with database schema

/**
 * DTO for lawyer's education information
 * Contains details about academic qualifications
 */
export class EducationDto implements Partial<Education> {
  @ApiProperty()
  id: string; // Unique identifier for the education record

  @ApiProperty()
  degree: string; // Academic degree obtained (e.g., LLB, JD)

  @ApiProperty()
  institution: string; // Name of the educational institution

  @ApiProperty()
  year: string; // Year of graduation
}

/**
 * DTO for lawyer's practice court information
 * Contains details about courts where the lawyer is authorized to practice
 */
export class PracticeCourtDto implements Partial<PracticeCourt> {
  @ApiProperty()
  id: string; // Unique identifier for the practice court record

  @ApiProperty()
  primary: string; // Primary court where the lawyer practices

  @ApiProperty({ required: false, nullable: true })
  secondary?: string; // Optional secondary court where the lawyer practices
}

/**
 * Base DTO for lawyer information used in listings
 * Contains only essential fields needed for lawyer cards/list views
 * Optimized for list endpoints where detailed information is not required
 */
export class LawyerDto implements Partial<Lawyer> {
  @ApiProperty()
  id: string; // Unique identifier for the lawyer

  @ApiProperty()
  name: string; // Full name of the lawyer

  @ApiProperty({ required: false, nullable: true })
  photo?: string | null; // URL to lawyer's profile photo, optional

  @ApiProperty({ type: [String] })
  practiceAreas: string[]; // Array of practice areas (e.g., "Criminal", "Family Law")

  @ApiProperty()
  location: string; // Geographical location of practice

  @ApiProperty()
  experience: number; // Years of professional experience

  @ApiProperty()
  consultFee: number; // Consultation fee amount
}

/**
 * Extended DTO for detailed lawyer information
 * Used for single lawyer view where complete profile is needed
 * Includes all base fields plus contact information and related entities
 */
export class LawyerDetailsDto extends LawyerDto {
  @ApiProperty({ required: false, nullable: true })
  email?: string; // Contact email address, optional

  @ApiProperty({ required: false, nullable: true })
  phone?: string; // Contact phone number, optional

  @ApiProperty({ required: false, nullable: true })
  bio?: string; // Professional biography/description, optional

  @ApiProperty()
  barId: string; // Bar association ID/license number

  @ApiProperty({ type: EducationDto })
  education: EducationDto; // Related education information

  @ApiProperty({ type: PracticeCourtDto })
  practiceCourt: PracticeCourtDto; // Related practice court information
}

/**
 * DTO for query parameters used in lawyer listing endpoint
 * Defines the structure of filter and pagination parameters
 * These parameters are passed as query string in the GET request
 */
export class LawyerQueryDto {
  @ApiProperty({ required: false })
  practiceArea?: string; // Filter by lawyer's practice area

  @ApiProperty({ required: false })
  location?: string; // Filter by lawyer's location

  @ApiProperty({ required: false })
  page?: number; // Page number for pagination

  @ApiProperty({ required: false })
  limit?: number; // Number of items per page
}

/**
 * DTO for pagination metadata
 * Used to provide information about paginated results
 * Helps client-side implement pagination controls
 */
export class PaginationDto {
  @ApiProperty()
  total: number; // Total number of records matching the filter criteria

  @ApiProperty()
  page: number; // Current page number

  @ApiProperty()
  limit: number; // Number of records per page

  @ApiProperty()
  totalPages: number; // Total number of pages available
}

/**
 * Standardized response wrapper for lawyer listing endpoint
 * Provides consistent API response structure
 * Includes success flag, data payload, and pagination metadata
 */
export class LawyerResponseDto {
  @ApiProperty()
  success: boolean; // Indicates if the request was successful

  @ApiProperty({ type: [LawyerDto] })
  data: LawyerDto[]; // Array of lawyer records

  @ApiProperty()
  pagination: PaginationDto; // Pagination metadata
}

/**
 * Standardized response wrapper for lawyer details endpoint
 * Provides consistent API response structure
 * Includes success flag and detailed lawyer data
 */
export class LawyerDetailsResponseDto {
  @ApiProperty()
  success: boolean; // Indicates if the request was successful

  @ApiProperty()
  data: LawyerDetailsDto; // Detailed lawyer information
}

// Add this to the existing file, after the other DTOs


// DTO for creating a new lawyer
export class CreateLawyerDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  photo?: string;

  @ApiProperty({ type: [String] })
  practiceAreas: string[];

  @ApiProperty()
  location: string;

  @ApiProperty()
  experience: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ required: false, nullable: true })
  bio?: string;

  @ApiProperty()
  consultFee: number;

  @ApiProperty()
  barId: string;

  @ApiProperty()
  education: {
    degree: string;
    institution: string;
    year: string;
  };

  @ApiProperty()
  practiceCourt: {
    primary: string;
    secondary?: string;
  };
}

// Make sure to export this DTO in the file
