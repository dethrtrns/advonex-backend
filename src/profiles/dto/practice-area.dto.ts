import { ApiProperty } from '@nestjs/swagger';
import { PracticeArea } from '@prisma/client';

/**
 * DTO for practice area information
 * Matches the Prisma schema exactly
 */
export class PracticeAreaDto implements PracticeArea {
  @ApiProperty({ description: 'Unique identifier for the practice area' })
  id: string;

  @ApiProperty({ description: 'Name of the practice area' })
  name: string;

  @ApiProperty({ description: 'Description of the practice area' })
  description: string;

  @ApiProperty({ description: 'When the practice area was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the practice area was last updated' })
  updatedAt: Date;
}
