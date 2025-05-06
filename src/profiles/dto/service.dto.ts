import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@prisma/client';

/**
 * DTO for service information
 * Matches the Prisma schema exactly
 */
export class ServiceDto implements Service {
  @ApiProperty({ description: 'Unique identifier for the service' })
  id: string;

  @ApiProperty({ description: 'Name of the service' })
  name: string;

  @ApiProperty({ description: 'Description of the service', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Whether this is a predefined service' })
  isPredefined: boolean;

  @ApiProperty({ description: 'When the service was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the service was last updated' })
  updatedAt: Date;
}
