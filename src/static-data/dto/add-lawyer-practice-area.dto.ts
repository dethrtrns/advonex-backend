import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for adding a practice area to a lawyer's profile.
 */
export class AddLawyerPracticeAreaDto {
  /**
   * The UUID of the PracticeArea to associate with the lawyer.
   * @example 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
   */
  @ApiProperty({
    description: 'The UUID of the PracticeArea to associate with the lawyer.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  practiceAreaId: string;
}
