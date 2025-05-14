import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    this.resend = new Resend(apiKey);
  }

  /**
   * Sends an OTP email to the specified email address
   * @param email The recipient's email address
   * @param otp The OTP code to send
   * @returns Promise<boolean> Whether the email was sent successfully
   */
  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    try {
      const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');
      if (!fromEmail) {
        throw new Error('RESEND_FROM_EMAIL is not configured');
      }

      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Your Advonex OTP Code',
        html: this.generateOtpEmailHtml(otp),
        text: this.generateOtpEmailText(otp),
      });

      if (error) {
        this.logger.error(`Failed to send OTP email: ${error.message}`);
        return false;
      }

      this.logger.log(
        `OTP email sent successfully to ${email} and tracking id: ${JSON.stringify(data, null, 2)}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Error sending OTP email: ${error.message}`);
      return false;
    }
  }

  /**
   * Generates HTML content for the OTP email
   * @param otp The OTP code
   * @returns string HTML content
   */
  private generateOtpEmailHtml(otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Advonex OTP Code</h2>
        <p>Your one-time password (OTP) is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${otp}</strong>
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
      </div>
    `;
  }

  /**
   * Generates plain text content for the OTP email
   * @param otp The OTP code
   * @returns string Plain text content
   */
  private generateOtpEmailText(otp: string): string {
    return `
      Your Advonex OTP Code

      Your one-time password (OTP) is: ${otp}

      This code will expire in 5 minutes.

      If you didn't request this OTP, please ignore this email.
    `;
  }
}
