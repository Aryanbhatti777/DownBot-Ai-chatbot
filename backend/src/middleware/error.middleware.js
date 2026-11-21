import { AppError } from "../utils/AppError.js";
import { config } from "../config/env.js";

/** Writes all API failures using the standard error envelope. */
export function errorMiddleware(error, _req, res, _next) {
  let statusCode = 500;
  let message = "Internal server error";
  let errors = [];

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern ?? error.keyValue ?? {})[0] ?? "email";
    message = "A user with this email already exists";
    errors = [{ field, message: "This value is already in use" }];
  } else if (error?.name === "CastError") {
    statusCode = 400;
    message = "Invalid request value";
    errors = [{ field: error.path ?? "id", message: "Invalid value" }];
  } else if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  } else {
    console.error("Unhandled request error:", error);
  }

  /** @type {{ success: false, message: string, errors: Array<{field: string, message: string}>, stack?: string }} */
  const response = { success: false, message, errors };
  if (config.nodeEnv !== "production" && error?.stack) {
    response.stack = error.stack;
  }
  return res.status(statusCode).json(response);
}
