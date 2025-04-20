import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LawyersModule } from './lawyers/lawyers.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [LawyersModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
