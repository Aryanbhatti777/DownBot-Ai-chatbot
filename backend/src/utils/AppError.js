/** Represents an expected HTTP error handled by the centralized middleware. */
export class AppError extends Error {
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, AppError);
  }
}
