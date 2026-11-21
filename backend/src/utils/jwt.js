import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/** Issues a 15-minute access token for a user. */
export function createAccessToken(user) {
  return jwt.sign({ id: String(user._id), email: user.email }, config.accessTokenSecret, { expiresIn: "15m" });
}

/** Issues a seven-day refresh token for a user. */
export function createRefreshToken(user) {
  return jwt.sign({ id: String(user._id), email: user.email }, config.refreshTokenSecret, { expiresIn: "7d" });
}

/** Verifies an access token and returns its typed identity payload. */
export function verifyAccessToken(token) {
  return jwt.verify(token, config.accessTokenSecret);
}

/** Verifies a refresh token and returns its typed identity payload. */
export function verifyRefreshToken(token) {
  return jwt.verify(token, config.refreshTokenSecret);
}
