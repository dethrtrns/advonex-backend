import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Upload a general image to the common uploads folder
   * @param file - The image file to upload
   * @returns URL and public ID of the uploaded image
   */
  async uploadImage(file: Express.Multer.File) {
    this.logger.log('Uploading general image');
    return this.cloudinaryService.uploadCommonImage(file);
  }

  /**
   * Upload a client profile picture and update the client profile
   * @param file - The profile picture file
   * @param user - The authenticated user's JWT payload
   * @returns URL and public ID of the uploaded image
   */
  async uploadClientProfilePic(file: Express.Multer.File, user: JwtPayload) {
    this.logger.log(`Uploading client profile picture for user ${user.sub}`);

    // Verify user exists and is a client
    const userData = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: {
        clientProfile: true,
        userRoles: {
          where: {
            isActive: true,
            role: Role.CLIENT,
          },
        },
      },
    });

    if (!userData || userData.userRoles.length === 0) {
      throw new Error('User not found or is not a client');
    }

    // Upload to client profile pictures folder
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      'advonex/client-profiles',
    );

    // Update client profile with new picture URL
    await this.prisma.clientProfile.update({
      where: { userId: user.sub },
      data: { photo: uploadResult.url },
    });

    return uploadResult;
  }

  /**
   * Upload a lawyer profile picture and update the lawyer profile
   * @param file - The profile picture file
   * @param user - The authenticated user's JWT payload
   * @returns URL and public ID of the uploaded image
   */
  async uploadLawyerProfilePic(file: Express.Multer.File, user: JwtPayload) {
    this.logger.log(`Uploading lawyer profile picture for user ${user.sub}`);

    // Verify user exists and is a lawyer
    const userData = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: {
        lawyerProfile: true,
        userRoles: {
          where: {
            isActive: true,
            role: Role.LAWYER,
          },
        },
      },
    });

    if (!userData || userData.userRoles.length === 0) {
      throw new Error('User not found or is not a lawyer');
    }

    // Upload to lawyer profile pictures folder
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      'advonex/lawyer-profiles',
    );

    // Update lawyer profile with new picture URL
    await this.prisma.lawyerProfile.update({
      where: { userId: user.sub },
      data: { photo: uploadResult.url },
    });

    return uploadResult;
  }
}
