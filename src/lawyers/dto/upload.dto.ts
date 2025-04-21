import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    imageUrl: string;
  };
}