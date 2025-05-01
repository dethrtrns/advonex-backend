import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Ensure ConfigModule is imported
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LawyersModule } from './lawyers/lawyers.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AuthModule } from './auth/auth.module'; // Import the new AuthModule
import { AuthModule } from './auth/auth.module';
import { LawyersModule } from './lawyers/lawyers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config globally available
    }),
    PrismaModule,
    LawyersModule,
    CloudinaryModule,
    AuthModule, // Add AuthModule here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
