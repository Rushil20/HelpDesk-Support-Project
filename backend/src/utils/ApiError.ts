export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown[];
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, errors: unknown[] = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request", errors: unknown[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized access", errors: unknown[] = []): ApiError {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = "Forbidden resource", errors: unknown[] = []): ApiError {
    return new ApiError(403, message, errors);
  }

  static notFound(message = "Resource not found", errors: unknown[] = []): ApiError {
    return new ApiError(404, message, errors);
  }

  static conflict(message = "Resource conflict", errors: unknown[] = []): ApiError {
    return new ApiError(409, message, errors);
  }

  static internal(message = "Internal server error", errors: unknown[] = []): ApiError {
    return new ApiError(500, message, errors, false);
  }
}

