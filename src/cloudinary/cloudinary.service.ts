import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'advonex',
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error || !result)
            return reject(error || new Error('Upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      // Convert buffer to stream and pipe to cloudinary
      // console.log('file', file);
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  /**
   * Uploads an image to the common uploads folder
   * @param file - Image file to upload
   * @returns Object containing the URL and public ID of the uploaded image
   */
  async uploadCommonImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    // Use the existing uploadImage method but specify the common uploads folder
    return this.uploadImage(file, 'advonex/common-uploads');
  }
}
