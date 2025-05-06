import { Module, Global } from '@nestjs/common';
import { SmsService, MockSmsService } from './sms.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService

// Module responsible for providing the SMS service implementation.
// Marked as Global so SmsService can be injected anywhere without importing SmsModule explicitly.
@Global() // Make the service available globally
@Module({
  imports: [ConfigModule], // Import ConfigModule if needed for real implementations
  providers: [
    {
      // Provide either MockSmsService or a real implementation based on environment/config
      provide: SmsService, // Use the abstract class as the token
      useFactory: (configService: ConfigService) => {
        // Example: Use environment variable to switch implementations
        // const useMock = configService.get<string>('SMS_PROVIDER') === 'mock';
        // if (useMock) {
        //   return new MockSmsService();
        // } else {
        //   // return new RealSmsService(configService); // Instantiate your real service
        // }

        // For now, always use the mock service
        return new MockSmsService();
      },
      inject: [ConfigService], // Inject ConfigService if needed by the factory
    },
  ],
  exports: [SmsService], // Export the abstract class token
})
export class SmsModule {}
