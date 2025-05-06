import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for requesting phone OTP
 * Matches the Prisma schema exactly
 */
export class RequestOtpDto {
  @ApiProperty({
    description: 'Phone number to send OTP to',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Role to assign to new user',
    enum: Role,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}

/**
 * DTO for verifying phone OTP
 * Matches the Prisma schema exactly
 */
export class VerifyOtpDto {
  @ApiProperty({
    description: 'Phone number to verify',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
