import { ApiProperty } from '@nestjs/swagger';
import { ClientProfile } from '@prisma/client';

export class ClientProfileResponseDto implements ClientProfile {
  @ApiProperty({ description: 'Unique identifier for the client profile' })
  id: string;

  @ApiProperty({ description: "Client's full name", nullable: true })
  name: string;

  @ApiProperty({
    description: "URL of the client's profile picture",
    nullable: true,
  })
  photo: string;

  @ApiProperty({ description: 'Whether registration is pending' })
  registrationPending: boolean;

  @ApiProperty({ description: 'User ID associated with this profile' })
  userId: string;

  @ApiProperty({ description: 'When the profile was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the profile was last updated' })
  updatedAt: Date;
}
