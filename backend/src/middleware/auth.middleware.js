import { findUserById } from "../DAO/user.dao.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

/** Authenticates a bearer access token and attaches its user to the request. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authorization = req.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }
  const payload = verifyAccessToken(authorization.slice(7));
  if (typeof payload === "string" || !payload.id) {
    throw new AppError(401, "Invalid or expired token");
  }
  const user = await findUserById(payload.id);
  if (!user) throw new AppError(401, "Invalid or expired token");
  req.user = user;
  return next();
});
