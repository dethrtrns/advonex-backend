import { ApiProperty } from '@nestjs/swagger';

// Class-level comment: Defines the standardized structure for API responses.
export class StandardResponseDto<T> {
  @ApiProperty({
    description: 'Indicates whether the request was successful.',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'A message providing details about the response.',
    example: 'Operation completed successfully.',
  })
  message: string;

  @ApiProperty({
    description: 'The actual data payload of the response.',
    type: () => Object, // Generic type, will be overridden by specific DTOs
  })
  data: T;


  // You can add other common fields like pagination info if needed,
  // or create a separate PaginatedResponseDto that extends this.
}