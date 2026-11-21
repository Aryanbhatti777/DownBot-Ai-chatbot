import { AppError } from "../utils/AppError.js";

/** Forwards unmatched routes to the centralized error middleware. */
export function notFoundMiddleware(_req, _res, next) {
  return next(new AppError(404, "Route not found"));
}
