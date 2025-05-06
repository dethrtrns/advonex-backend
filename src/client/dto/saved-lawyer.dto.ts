import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for a saved lawyer in the client's shortlist.
 */
export class SavedLawyerDto {
  @ApiProperty({
    description: 'Unique identifier of the saved lawyer record',
  })
  id: string;

  @ApiProperty({
    description: 'The lawyer profile information',
  })
  lawyer: {
    id: string;
    name: string | null;
    photo?: string | null;
    location?: string | null;
    experience?: number | null;
    bio?: string | null;
    consultFee?: number | null;
    isVerified: boolean;
    specialization?: {
      id: string;
      name: string;
    } | null;
    primaryCourt?: {
      id: string;
      name: string;
    } | null;
  };

  @ApiProperty({
    description: 'Date when the lawyer was saved',
  })
  savedAt: Date;
}
 