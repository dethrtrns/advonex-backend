import { ApiProperty } from '@nestjs/swagger';
import { PracticeCourt } from '@prisma/client';

/**
 * DTO for practice court information
 * Matches the Prisma schema exactly
 */
export class PracticeCourtDto implements PracticeCourt {
  @ApiProperty({ description: 'Unique identifier for the practice court' })
  id: string;

  @ApiProperty({ description: 'Name of the practice court' })
  name: string;

  @ApiProperty({ description: 'Location of the practice court' })
  location: string;

  @ApiProperty({ description: 'When the practice court was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the practice court was last updated' })
  updatedAt: Date;
}
