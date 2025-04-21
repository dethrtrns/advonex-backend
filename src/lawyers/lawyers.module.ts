import { Module } from '@nestjs/common';
import { LawyersController } from './lawyers.controller';
import { LawyersService } from './lawyers.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [LawyersController],
  providers: [LawyersService, PrismaService],
  exports: [LawyersService],
})
export class LawyersModule {}
