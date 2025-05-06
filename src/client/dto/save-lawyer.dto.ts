import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Data Transfer Object for saving a lawyer to a client's shortlist.
 */
export class SaveLawyerDto {
  /**
   * The UUID of the lawyer profile to save.
   * @example '550e8400-e29b-41d4-a716-446655440000'
   */
  @ApiProperty({
    description: 'The UUID of the lawyer profile to save',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  lawyerId: string;
}
