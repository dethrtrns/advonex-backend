import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'The actual data returned by the API',
  })
  data: T;

  @ApiProperty({
    description: 'Optional message providing additional information',
    required: false,
    example: 'Operation completed successfully',
  })
  message?: string;

  constructor(data: T, message?: string) {
    this.success = true;
    this.data = data;
    if (message) {
      this.message = message;
    }
  }
}
