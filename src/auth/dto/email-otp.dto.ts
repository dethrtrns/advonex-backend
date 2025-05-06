import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for requesting email OTP
 * Matches the Prisma schema exactly
 */
export class EmailOtpRequestDto {
  @ApiProperty({
    description: 'Email address to send OTP to',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

/**
 * DTO for verifying email OTP
 * Matches the Prisma schema exactly
 */
export class EmailOtpVerifyDto {
  @ApiProperty({
    description: 'Email address to verify',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    description: 'Optional role to assign to new user',
    enum: Role,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

/**
 * DTO for unified OTP request (email or phone)
 * Matches the Prisma schema exactly
 */
export class UnifiedOtpRequestDto {
  @ApiProperty({
    description: 'Email address to send OTP to',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number to send OTP to',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

/**
 * DTO for unified OTP verification (email or phone)
 * Matches the Prisma schema exactly
 */
export class UnifiedOtpVerifyDto {
  @ApiProperty({
    description: 'Email address to verify',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number to verify',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    description: 'Optional role to assign to new user',
    enum: Role,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
