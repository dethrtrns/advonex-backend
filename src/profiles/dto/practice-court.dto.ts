import { ApiProperty } from '@nestjs/swagger';
import { PracticeCourt } from '@prisma/client';
import { LocationDetailsDto } from '../../common/dto/location-details.dto';

/**
 * DTO for practice court information
 * Matches the Prisma schema exactly
 */
export class PracticeCourtDto implements PracticeCourt {
  @ApiProperty({ description: 'Unique identifier for the practice court' })
  id: string;

  @ApiProperty({ description: 'Name of the practice court' })
  name: string;

  @ApiProperty({ description: 'Location ID of the practice court', nullable: true })
  locationId: string | null;

  @ApiProperty({ type: Object, nullable: true })
  location?: LocationDetailsDto | null;

  @ApiProperty({ description: 'When the practice court was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the practice court was last updated' })
  updatedAt: Date;
}
