import { UserModel } from "../models/user.model.js";

/** Creates and persists a user document. */
export async function createUser(input) {
  return UserModel.create(input);
}

/** Finds a user by normalized email. */
export async function findUserByEmail(email) {
  return UserModel.findOne({ email: email.toLowerCase() }).select("+password");
}

/** Finds a user by ID. */
export async function findUserById(id) {
  return UserModel.findById(id);
}

/** Finds a user by ID including its persisted refresh token. */
export async function findUserByIdWithRefreshToken(id) {
  return UserModel.findById(id).select("+refreshToken");
}

/** Persists the active refresh token for a user. */
export async function updateRefreshToken(id, refreshToken) {
  return UserModel.findByIdAndUpdate(id, { refreshToken }, { new: true }).select("+refreshToken");
}

/** Invalidates the active refresh token for a user. */
export async function clearRefreshToken(id) {
  return UserModel.findByIdAndUpdate(id, { $unset: { refreshToken: 1 } }, { new: true });
}
