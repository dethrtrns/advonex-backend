import { Module, Logger } from '@nestjs/common'; // Import Logger
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { PrismaModule } from './prisma/prisma.module'; // Import PrismaModule
import { AuthModule } from './auth/auth.module'; // Import AuthModule
import { SmsModule } from './sms/sms.module'; // Import SmsModule
import { ScheduleModule } from '@nestjs/schedule'; // Import ScheduleModule
import { ProfilesModule } from './profiles/profiles.module';
import { StaticDataModule } from './static-data/static-data.module';
import { LawyersModule } from './lawyers/lawyers.module';
import { ClientModule } from './client/client.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LawyerModule } from './lawyer/lawyer.module';
import { UploadModule } from './upload/upload.module';
// Remove APP_GUARD and RateLimiterGuard imports if no longer needed globally

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 500,
      },
    ]),
    ScheduleModule.forRoot(), // Add ScheduleModule here
    PrismaModule, // Make PrismaService available (Global)
    AuthModule, // Include Auth module features
    SmsModule, // Add SmsModule here (Global)
    ProfilesModule,
    StaticDataModule,
    LawyersModule,
    // ClientModule,
    // LawyerModule,
    UploadModule,
    // Add other feature modules here as they are created
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger, // Provide Logger globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Remove the global RateLimiterGuard provider
    // {
    //   provide: APP_GUARD,
    //   useClass: RateLimiterGuard,
    // },
  ],
})
export class AppModule {}
