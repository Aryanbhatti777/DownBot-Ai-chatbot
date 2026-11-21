import { clearRefreshToken, createUser, findUserByEmail, findUserByIdWithRefreshToken, updateRefreshToken } from "../DAO/user.dao.js";
import { config } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth"
};

function toPublicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email };
}

function issueTokens(user) {
  return { accessToken: createAccessToken(user), refreshToken: createRefreshToken(user) };
}

/** Registers a user and returns an access token with a refresh cookie. */
export const register = asyncHandler(async (req, res) => {
  const user = await createUser({ name: req.body.name, email: req.body.email, password: req.body.password });
  const tokens = issueTokens(user);
  await updateRefreshToken(user._id, tokens.refreshToken);
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);
  return sendSuccess(res, 201, "Registration successful", {
    accessToken: tokens.accessToken,
    user: toPublicUser(user)
  });
});

/** Authenticates credentials and returns an access token with a refresh cookie. */
export const login = asyncHandler(async (req, res) => {
  const user = await findUserByEmail(req.body.email);
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError(401, "Invalid credentials");
  }
  const tokens = issueTokens(user);
  await updateRefreshToken(user._id, tokens.refreshToken);
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);
  return sendSuccess(res, 200, "Login successful", {
    accessToken: tokens.accessToken,
    user: toPublicUser(user)
  });
});

/** Rotates the persisted refresh token and returns a new access token. */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError(401, "Invalid refresh token");
  const payload = verifyRefreshToken(token);
  if (typeof payload === "string" || !payload.id) throw new AppError(401, "Invalid refresh token");
  const user = await findUserByIdWithRefreshToken(payload.id);
  if (!user || user.refreshToken !== token) throw new AppError(401, "Invalid refresh token");
  const tokens = issueTokens(user);
  await updateRefreshToken(user._id, tokens.refreshToken);
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);
  return sendSuccess(res, 200, "Token refreshed", {
    accessToken: tokens.accessToken,
    user: toPublicUser(user)
  });
});

/** Invalidates the verified refresh token and clears its cookie. */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      if (typeof payload !== "string" && payload.id) {
        const user = await findUserByIdWithRefreshToken(payload.id);
        if (user?.refreshToken === token) await clearRefreshToken(user._id);
      }
    } catch (error) {
      if (error?.name !== "JsonWebTokenError" && error?.name !== "TokenExpiredError") throw error;
    }
  }
  res.clearCookie("refreshToken", { ...cookieOptions, maxAge: undefined });
  return sendSuccess(res, 200, "Logout successful", {});
});

/** Returns the authenticated user's public profile. */
export const me = asyncHandler(async (req, res) =>
  sendSuccess(res, 200, "Profile retrieved", { user: toPublicUser(req.user) })
);
