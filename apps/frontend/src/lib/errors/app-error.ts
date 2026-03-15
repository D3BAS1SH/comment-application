import type { ErrorCode } from '../constants/error-codes';

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}
