export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super('AUTHORIZATION_ERROR', message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super('NOT_FOUND_ERROR', message, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT_ERROR', message, 429);
    this.name = 'RateLimitError';
  }
}

export class APIError extends AppError {
  constructor(
    message: string,
    public originalError?: any,
    details?: any
  ) {
    super('API_ERROR', message, 500, details);
    this.name = 'APIError';
  }
}

export function handleError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }

  // Handle network errors
  if (error.name === 'NetworkError' || error.message.includes('network')) {
    return new APIError('Network error occurred', error);
  }

  // Handle API errors
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || 'API request failed';
    const details = error.response.data;

    switch (status) {
      case 400:
        return new ValidationError(message, details);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(message);
      case 429:
        return new RateLimitError(message);
      default:
        return new APIError(message, error, details);
    }
  }

  // Handle unknown errors
  return new APIError(
    'An unexpected error occurred',
    error,
    { message: error.message, stack: error.stack }
  );
}

export function logError(error: AppError): void {
  console.error({
    name: error.name,
    code: error.code,
    message: error.message,
    status: error.status,
    details: error.details,
    timestamp: new Date().toISOString(),
    stack: error.stack,
  });
}

export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
} 