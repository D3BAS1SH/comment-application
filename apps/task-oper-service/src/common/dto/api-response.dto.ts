import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T = unknown> {
  @ApiProperty({
    example: true,
    description: 'Indicates whether the request was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code of the response',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Request completed successfully',
    description: 'A human-readable message describing the result',
  })
  message: string;

  @ApiProperty({
    description: 'The response payload. Null on errors.',
    nullable: true,
  })
  data: T | null;

  @ApiProperty({
    example: '2026-05-14T08:00:00.000Z',
    description: 'ISO 8601 timestamp of when the response was generated',
  })
  timestamp: string;

  private constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data: T | null
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Creates a successful API response.
   *
   * @param data     - The payload to return to the client.
   * @param message  - Optional success message (default: 'Request completed successfully').
   * @param statusCode - Optional HTTP status code (default: 200).
   */
  static success<T>(
    data: T,
    message = 'Request completed successfully',
    statusCode = 200
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, statusCode, message, data);
  }

  /**
   * Creates an error / failure API response.
   *
   * @param message    - Human-readable error description.
   * @param statusCode - HTTP status code (default: 500).
   */
  static error(
    message = 'An unexpected error occurred',
    statusCode = 500
  ): ApiResponse<null> {
    return new ApiResponse<null>(false, statusCode, message, null);
  }
}
