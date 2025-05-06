import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus, ResponseStatus } from '@prisma/client';

export class ConsultationRequestClientDto {
  @ApiProperty({ description: 'Client name' })
  name: string;

  @ApiProperty({ description: 'Client photo URL' })
  photo?: string;
}

export class ConsultationRequestDto {
  @ApiProperty({ description: 'Request ID' })
  id: string;

  @ApiProperty({ description: 'Client information' })
  clientProfile: ConsultationRequestClientDto;

  @ApiProperty({ description: 'Request message' })
  message: string;

  @ApiProperty({ description: 'Request status', enum: RequestStatus })
  status: RequestStatus;

  @ApiProperty({ description: 'Response status', enum: ResponseStatus })
  responseStatus: ResponseStatus;

  @ApiProperty({ description: 'Lawyer response message' })
  response?: string;

  @ApiProperty({ description: 'Reason for rejection if rejected' })
  responseReason?: string;

  @ApiProperty({ description: 'Request creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Request last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Response timestamp if responded' })
  responseTimestamp?: Date;
}

export class ConsultationRequestsResponseDto {
  @ApiProperty({
    description: 'List of consultation requests',
    type: [ConsultationRequestDto],
  })
  requests: ConsultationRequestDto[];

  @ApiProperty({ description: 'Total number of requests' })
  total: number;

  @ApiProperty({ description: 'Number of pending requests' })
  pending: number;

  @ApiProperty({ description: 'Number of accepted requests' })
  accepted: number;

  @ApiProperty({ description: 'Number of rejected requests' })
  rejected: number;
}
