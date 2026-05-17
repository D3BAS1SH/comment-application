import { ServiceError } from './service-error';

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: ServiceError };
