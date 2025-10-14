import { HttpException } from '@nestjs/common';

/**
 * The base class for all custom exceptions in the application.
 * It standardizes the error structure to include a message, status code,
 * a machine-readable error code, and optional developer-focused details.
 */
export class AppException extends HttpException {
  /**
   * @param message A human-readable message intended for the client.
   * @param statusCode The HTTP status code (e.g., 404, 409).
   * @param errorCode A custom, machine-readable string for the client to identify the error type.
   * @param details Optional developer-focused details for logging purposes.
   */
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly details?: object, // Optional details for server-side logging
  ) {
    // The first argument to the parent HttpException is the JSON response body.
    // The second argument is the HTTP status code.
    super({ message, errorCode, statusCode }, statusCode);
  }
}
