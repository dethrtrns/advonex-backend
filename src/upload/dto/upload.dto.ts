import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload',
  })
  file: Express.Multer.File;
}

export class UploadProfilePicDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture file to upload',
  })
  file: Express.Multer.File;

  @ApiProperty({
    description: 'User ID of the profile to update',
  })
  userId: string;
}

export class UploadImageResponseDto {
  @ApiProperty({
    description: 'Success status of the upload',
  })
  success: boolean;

  @ApiProperty({
    description: 'Upload result data',
    properties: {
      imageUrl: {
        type: 'string',
        description: 'URL of the uploaded image',
      },
      publicId: {
        type: 'string',
        description: 'Public ID of the uploaded image in cloud storage',
      },
    },
  })
  data: {
    imageUrl: string;
    publicId: string;
  };
}
