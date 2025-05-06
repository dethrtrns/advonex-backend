import { ApiProperty } from '@nestjs/swagger';
import { Education } from '@prisma/client';

/**
 * DTO for education information
 * Matches the Prisma schema exactly
 */
export class EducationDto implements Education {
  @ApiProperty({ description: 'Unique identifier for the education record' })
  id: string;

  @ApiProperty({ description: 'Degree obtained' })
  degree: string;

  @ApiProperty({ description: 'Institution where the degree was obtained' })
  institution: string;

  @ApiProperty({ description: 'Year when the degree was obtained' })
  year: number;

  @ApiProperty({ description: 'ID of the associated lawyer profile' })
  lawyerProfileId: string;

  @ApiProperty({ description: 'When the education record was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the education record was last updated' })
  updatedAt: Date;
}
