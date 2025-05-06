import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

// Class-level comment: Defines the structure and validation rules for the verify OTP endpoint payload.
export class VerifyOtpDto {
  @ApiProperty({
    description: 'The phone number the OTP was sent to (E.164 format).',
    example: '+15551234567',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'phoneNumber must be a valid E.164 format phone number (e.g., +15551234567)',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'The 6-digit OTP code received by the user.',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'otp must be exactly 6 digits' })
  otp: string;
}