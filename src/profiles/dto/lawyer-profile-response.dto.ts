import { ApiProperty } from '@nestjs/swagger';
import { LawyerProfile } from '@prisma/client';
import { PracticeAreaDto } from './practice-area.dto';
import { PracticeCourtDto } from './practice-court.dto';
import { ServiceDto } from './service.dto';
import { EducationDto } from './education.dto';

/**
 * DTO for lawyer profile response
 * Matches the Prisma schema exactly and includes all related entities
 * Used for Swagger documentation and response type safety
 */
export class LawyerProfileResponseDto implements LawyerProfile {
  @ApiProperty({ description: 'Unique identifier for the lawyer profile' })
  id: string;

  @ApiProperty({ description: "Lawyer's name", nullable: true })
  name: string | null;

  @ApiProperty({ description: "Lawyer's profile photo URL", nullable: true })
  photo: string | null;

  @ApiProperty({ description: "Lawyer's location", nullable: true })
  location: string | null;

  @ApiProperty({
    description: 'Years of professional experience',
    nullable: true,
  })
  experience: number | null;

  @ApiProperty({
    description: "Lawyer's professional biography",
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({ description: 'Consultation fee', nullable: true })
  consultFee: number | null;

  @ApiProperty({ description: 'Bar registration number', nullable: true })
  barId: string | null;

  @ApiProperty({ description: 'Whether the lawyer is verified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Whether registration is pending' })
  registrationPending: boolean;

  @ApiProperty({ description: 'User ID associated with this profile' })
  userId: string;

  @ApiProperty({ description: 'Primary specialization ID', nullable: true })
  specializationId: string | null;

  @ApiProperty({ description: 'Primary court ID', nullable: true })
  primaryCourtId: string | null;

  @ApiProperty({ description: 'When the profile was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the profile was last updated' })
  updatedAt: Date;

  @ApiProperty({ type: () => PracticeAreaDto, nullable: true })
  specialization: PracticeAreaDto | null;

  @ApiProperty({ type: () => PracticeCourtDto, nullable: true })
  primaryCourt: PracticeCourtDto | null;

  @ApiProperty({ type: () => [PracticeAreaDto] })
  practiceAreas: PracticeAreaDto[];

  @ApiProperty({ type: () => [PracticeCourtDto] })
  practiceCourts: PracticeCourtDto[];

  @ApiProperty({ type: () => [ServiceDto] })
  services: ServiceDto[];

  @ApiProperty({ type: () => EducationDto, nullable: true })
  education: EducationDto | null;
}
