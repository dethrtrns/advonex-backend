import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { LocationDetailsDto } from '../../common/dto/location-details.dto';

/**
 * Data Transfer Object for a consultation request response.
 */
export class ConsultationRequestResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the consultation request',
  })
  id: string;

  @ApiProperty({
    description: 'The lawyer profile information',
  })
  lawyer: {
    id: string;
    name: string | null;
    photo?: string | null;
    location?: LocationDetailsDto | null;
    experience?: number | null;
    bio?: string | null;
    consultFee?: number | null;
    isVerified: boolean;
    specialization?: {
      id: string;
      name: string;
    } | null;
    primaryCourt?: {
      id: string;
      name: string;
    } | null;
  };

  @ApiProperty({
    description: 'The message sent to the lawyer',
  })
  message: string;

  @ApiProperty({
    description: 'The current status of the request',
    enum: RequestStatus,
  })
  status: RequestStatus;

  @ApiProperty({
    description: 'Date when the request was created',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the request was last updated',
  })
  updatedAt: Date;
}
