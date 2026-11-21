import { body, validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

/** Validates registration fields before controller execution. */
export const registerValidator = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Za-z]/).withMessage("Password must contain a letter")
    .matches(/\d/).withMessage("Password must contain a number")
];

/** Validates login fields without revealing which credential failed. */
export const loginValidator = [
  body("email").isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Email or password is required")
];

/** Converts validation failures into the shared field-error response. */
export function validate(req, _res, next) {
  const fieldErrors = validationResult(req).array().map((error) => ({
    field: error.path,
    message: error.msg
  }));
  if (fieldErrors.length) return next(new AppError(422, "Validation failed", fieldErrors));
  return next();
}
