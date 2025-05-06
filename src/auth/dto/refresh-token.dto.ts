import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for refresh token requests
 * Matches the Prisma schema exactly
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token string',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
