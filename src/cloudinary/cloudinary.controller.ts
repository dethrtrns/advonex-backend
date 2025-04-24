import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { multerConfig } from './multer.config';
import { UploadImageResponseDto } from './dto/upload.dto';

@ApiTags('uploads')
@Controller('api/uploads')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * POST /api/uploads/image - Uploads an image to the common uploads folder
   * @param file - Image file to upload
   * @returns URL and public ID of the uploaded image
   */
  @Post('image')
  @ApiOperation({ summary: 'Upload an image to common storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Image uploaded successfully',
    type: UploadImageResponseDto 
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      // Upload image to Cloudinary in the common uploads folder
      const uploadResult = await this.cloudinaryService.uploadCommonImage(file);
  
      return {
        success: true,
        data: {
          imageUrl: uploadResult.url,
          publicId: uploadResult.publicId,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error uploading image');
    }
  }
}