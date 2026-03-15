import { AxiosError } from 'axios';
import { CustomErrorResponseDto } from '@/types/custom-error-response.interface';

export class ServiceError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly timestamp: string;
  public readonly path: string;

  constructor(errorData: CustomErrorResponseDto) {
    super(errorData.message);
    this.name = 'ServiceError';
    this.statusCode = errorData.statusCode;
    this.errorCode = errorData.errorCode;
    this.timestamp = errorData.timestamp;
    this.path = errorData.path;
  }
}

export function handleAxiosError(error: unknown): {
  data: null;
  error: ServiceError;
} {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as CustomErrorResponseDto;
    return { data: null, error: new ServiceError(data) };
  }

  return {
    data: null,
    error: new ServiceError({
      statusCode: 500,
      message:
        error instanceof Error ? error.message : 'Unknown internal error',
      timestamp: new Date().toISOString(),
      path: 'internal',
    }),
  };
}
