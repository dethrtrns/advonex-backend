import { Injectable, Logger } from '@nestjs/common';

// Abstract class defining the contract for sending SMS messages.
// Concrete implementations will handle specific providers (e.g., Twilio, Mock).
export abstract class SmsService {
  // Abstract method to send an OTP.
  // @param phoneNumber - The recipient's phone number.
  // @param otp - The one-time password to send.
  // @returns A promise that resolves when the SMS is sent (or simulated).
  abstract sendOtp(phoneNumber: string, otp: string): Promise<void>;
}

// Mock implementation of SmsService for development and testing.
// Logs the OTP instead of sending a real SMS.
@Injectable()
export class MockSmsService extends SmsService {
  private readonly logger = new Logger(MockSmsService.name);

  // Simulates sending an OTP by logging it.
  // @param phoneNumber - The recipient's phone number.
  // @param otp - The one-time password.
  // @returns A resolved promise.
  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    this.logger.log(
      `[MOCK SMS] Sending OTP ${otp} to phone number ${phoneNumber}`,
    );
    // In a real implementation, you would interact with the SMS provider API here.
    return Promise.resolve();
  }
}