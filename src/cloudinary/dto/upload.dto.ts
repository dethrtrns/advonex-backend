import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({
    type: 'object',
    properties: {
      imageUrl: { type: 'string' },
      publicId: { type: 'string' },
    },
  })
  data: {
    imageUrl: string;
    publicId: string;
  };
}
