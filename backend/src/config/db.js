import mongoose from "mongoose";
import { config } from "./env.js";

/** Connects to the configured MongoDB database. */
export async function connectDatabase() {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");
}
