export type TypeResult<T> =
  | { isSuccess: true; result: T }
  | { isSuccess: false; errorMessages: string[]; details?: any };
