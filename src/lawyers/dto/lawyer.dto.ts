import { ApiProperty } from '@nestjs/swagger';
import { Lawyer, Education } from '@prisma/client';

// Use Prisma-generated types as base types
export class EducationDto implements Partial<Education> {
  @ApiProperty()
  id: string;

  @ApiProperty()
  degree: string;

  @ApiProperty()
  institution: string;

  @ApiProperty()
  year: string;
}

// For lawyers listing, we only need a subset of fields
export class LawyerDto implements Partial<Lawyer> {
  @ApiProperty()
  id: string;

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
  consultFee: number;
}

// For lawyer details, we extend the base type and add related data
export class LawyerDetailsDto extends LawyerDto {
  @ApiProperty({ required: false, nullable: true })
  email?: string;

  @ApiProperty({ required: false, nullable: true })
  phone?: string;

  @ApiProperty({ required: false, nullable: true })
  bio?: string;

  @ApiProperty()
  barId: string;

  @ApiProperty({ type: [EducationDto] })
  education: EducationDto[];
}

// Query parameters are not from Prisma types, so we define them as needed
export class LawyerQueryDto {
  @ApiProperty({ required: false })
  practiceArea?: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  page?: number;

  @ApiProperty({ required: false })
  limit?: number;
}

// Response wrapper types
export class PaginationDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class LawyerResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: [LawyerDto] })
  data: LawyerDto[];

  @ApiProperty()
  pagination: PaginationDto;
}

export class LawyerDetailsResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: LawyerDetailsDto;
}