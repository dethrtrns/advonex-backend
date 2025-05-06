import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SmsModule } from '../sms/sms.module';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { RateLimiterModule, RateLimiterGuard } from 'nestjs-rate-limiter';
import { ResendModule } from '../resend/resend.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Register Passport
    JwtModule.registerAsync({
      // Register JWT module asynchronously to use ConfigService
      imports: [ConfigModule], // Import ConfigModule here
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService], // Inject ConfigService into the factory
    }),
    ConfigModule,
    SmsModule,
    ResendModule,
    ScheduleModule.forRoot(),
    RateLimiterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        for: 'Express',
        type: 'Memory',
        keyPrefix: 'auth',
        points: configService.get<number>('RATE_LIMIT_POINTS', 5),
        duration: configService.get<number>('RATE_LIMIT_DURATION', 60),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    ConfigService,
    RateLimiterGuard, // Register RateLimiterGuard provider
  ],
  exports: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    PassportModule,
    JwtModule,
  ], // Export RefreshTokenStrategy if needed elsewhere
})
export class AuthModule {}
