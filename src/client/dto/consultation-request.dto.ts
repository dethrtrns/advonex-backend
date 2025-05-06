import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for creating a consultation request.
 */
export class ConsultationRequestDto {
  /**
   * The UUID of the lawyer profile to request consultation from.
   * @example '550e8400-e29b-41d4-a716-446655440000'
   */
  @ApiProperty({
    description: 'The UUID of the lawyer profile to request consultation from',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  lawyerId: string;

  /**
   * The message to send to the lawyer.
   * @example 'I need help with a contract review for my startup.'
   */
  @ApiProperty({
    description: 'The message to send to the lawyer',
    example: 'I need help with a contract review for my startup.',
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  message: string;
}
