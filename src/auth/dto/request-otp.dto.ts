import { ApiProperty } from '@nestjs/swagger';
// --- Edit Start ---
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator'; // Remove IsPhoneNumber import
// --- Edit End ---
import { Role } from '@prisma/client';

// Class-level comment: Defines the structure and validation rules for the request OTP endpoint payload.
export class RequestOtpDto {
  @ApiProperty({
    description: 'The phone number of the user requesting the OTP (E.164 format).',
    example: '+15551234567',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'phoneNumber must be a valid E.164 format phone number (e.g., +15551234567)',
  })
  // --- Edit Start ---
  // Remove @IsPhoneNumber decorator
  // --- Edit End ---
  phoneNumber: string;

  @ApiProperty({
    description: 'The role the user is trying to register or log in with.',
    enum: Role,
    example: Role.CLIENT,
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}