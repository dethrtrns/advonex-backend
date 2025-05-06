import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { LawyersService } from './lawyers.service';
import { LawyersController } from './lawyers.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 60 * 1000, // 1 minute
      max: 100, // maximum number of items in cache
    }),
  ], // Import PrismaModule for database access
  controllers: [LawyersController],
  providers: [LawyersService],
  exports: [LawyersService], // Export service if needed elsewhere
})
export class LawyersModule {}
