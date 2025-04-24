import { ApiProperty } from '@nestjs/swagger';
import { LawyerDetailsDto } from './lawyer.dto';

export class UploadImageResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({
    type: 'object',
    properties: {
      imageUrl: { type: 'string' },
      publicId: { type: 'string' },
      lawyer: { type: LawyerDetailsDto },
    },
  })
  data: {
    imageUrl: string;
    publicId: string;
    lawyer?: LawyerDetailsDto;
  };
}