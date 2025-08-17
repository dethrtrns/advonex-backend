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
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LawyerProfile } from '@prisma/client';
import { PracticeCourtDto } from './practice-court.dto';
import { PracticeAreaDto } from './practice-area.dto';
import { CityDto, LocationDetailsDto } from 'src/common/dto/location-details.dto';

// export class UpdateLocationDto {

//   @ApiPropertyOptional({ description: 'Location ID' })
//   @IsOptional()
//   @IsUUID()
//   locationId?: string;
//   // Either ID or name must be present for cities, Handle validation in app logic
//   @ApiPropertyOptional({ description: 'City ID' })
//   // @IsOptional()
//   @IsUUID()
//   cityId: string;

//   @ApiPropertyOptional({ description: 'City name' })
//   @IsOptional()
//   @IsString()
//   cityName?: string;

//   // @ApiPropertyOptional({ description: 'City', type: Object, nullable: true })
//   // // @IsOptional()
//   // @ValidateNested()
//   // @Type(() => CityDto)
//   // city: {
//   //   id: string;
//   //   name?: string;
//   // };
//   @ApiPropertyOptional({ description: 'Full address' })
//   @IsOptional()
//   @IsString()
//   address?: string;

//   @ApiPropertyOptional({ description: 'Latitude' })
//   @IsOptional()
//   @IsInt()
//   latitude?: number;

//   @ApiPropertyOptional({ description: 'Longitude' })
//   @IsOptional()
//   @IsInt()
//   longitude?: number;
// }

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

  @ApiPropertyOptional({ type: () => LocationDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  location?: LocationDetailsDto | undefined;


  @ApiPropertyOptional({
    description: 'Primary location ID',
  })
  @IsOptional()
  @IsString()
  locationId?: string;

  // Review
  @ApiPropertyOptional({
    description: 'Practice Courts: IF you want to update location of practice courts: either locationId or cityId must be present.',
    type: 'array',
    items: {
      type: 'object',
    properties: {
      name: { type: 'string' },
      locationId: { type: 'string', nullable: true },
      location: { type: 'object', nullable: true, properties: {
        id: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
        latitude: { type: 'number', nullable: true },
        longitude: { type: 'number', nullable: true },
        city: { type: 'object', properties: {
          id: { type: 'string', nullable: true },
          name: { type: 'string', nullable: true },
        }},
      }},
     
    },
}})

  @IsOptional()
  @IsArray()
  practiceCourts?: PracticeCourtDto[] | undefined;

  @ApiPropertyOptional({
    description: 'Practice Areas',
    type: 'array',
    items: {
      type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string', nullable: true },
     
    },
}})
  @IsOptional()
  @IsArray()
  practiceAreas?: PracticeAreaDto[] | undefined;
  

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
