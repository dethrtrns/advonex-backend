import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for adding a practice court to a lawyer's profile.
 */
export class AddLawyerPracticeCourtDto {
  /**
   * The UUID of the PracticeCourt to associate with the lawyer.
   * @example 'b2c3d4e5-f6a7-8901-2345-67890abcdef1'
   */
  @ApiProperty({
    description: 'The UUID of the PracticeCourt to associate with the lawyer.',
    example: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
  })
  @IsNotEmpty()
  @IsUUID()
  practiceCourtId: string;
}
