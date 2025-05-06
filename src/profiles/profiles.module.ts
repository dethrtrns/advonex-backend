import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule if needed
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for guards

@Module({
  imports: [PrismaModule, AuthModule], // Import necessary modules
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService], // Export service if needed elsewhere
})
export class ProfilesModule {}
