import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { multerConfig } from '../cloudinary/multer.config';
import { UploadImageDto, UploadImageResponseDto } from './dto/upload.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HasUserRoleGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Request } from 'express';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  
  @Post('image')
  @ApiOperation({
    summary: 'Upload a general image',
    description:
      'Upload a general image. Note: This endpoint only handles file upload, it does not store or track the image URL. The frontend is responsible for managing the uploaded image URLs.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: UploadImageResponseDto,
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      const uploadResult = await this.uploadService.uploadImage(file);
      return {
        success: true,
        message:
          'Image uploaded successfully. Note: The backend does not store this URL. Please handle URL storage in your application.',
        data: {
          imageUrl: uploadResult.url,
          publicId: uploadResult.publicId,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error uploading image');
    }
  }

  @Post('profile-pic/client')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload a client profile picture',
    description:
      'Upload and update client profile picture. Requires CLIENT role.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({
    status: 201,
    description: 'Profile picture uploaded successfully',
    type: UploadImageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have CLIENT role',
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadClientProfilePic(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    try {
      const user = req.user as JwtPayload;
      const uploadResult = await this.uploadService.uploadClientProfilePic(
        file,
        user,
      );
      return {
        success: true,
        message: 'Client profile picture updated successfully',
        data: {
          imageUrl: uploadResult.url,
          publicId: uploadResult.publicId,
        },
      };
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('not a client')
      ) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Error uploading profile picture');
    }
  }

  @Post('profile-pic/lawyer')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.LAWYER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload a lawyer profile picture',
    description:
      'Upload and update lawyer profile picture. Requires LAWYER role.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({
    status: 201,
    description: 'Profile picture uploaded successfully',
    type: UploadImageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have LAWYER role',
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadLawyerProfilePic(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    try {
      const user = req.user as JwtPayload;
      // console.info('recieved', req.body, '>>>>>>>>>>> file recieved', file);
      const uploadResult = await this.uploadService.uploadLawyerProfilePic(
        file,
        user,
      );
      return {
        success: true,
        message: 'Lawyer profile picture updated successfully',
        data: {
          imageUrl: uploadResult.url,
          publicId: uploadResult.publicId,
        },
      };
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('not a lawyer')
      ) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'Error uploading profile picture:-->',
        error,
      );
    }
  }
}
