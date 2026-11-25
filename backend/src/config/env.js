import dotenv from "dotenv";

dotenv.config();

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/** @type {Readonly<{ mongoUri: string, port: number, nodeEnv: string, accessTokenSecret: string, refreshTokenSecret: string }>} */
export const config = Object.freeze({
  mongoUri: required("MONGO_URI"),
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  accessTokenSecret: required("ACCESS_TOKEN_SECRET"),
  refreshTokenSecret: required("REFRESH_TOKEN_SECRET"),
  GROQ_API_KEY: required("GROQ_API_KEY"),
  TAVILY_URL: required("TAVILY_URL"),
  COHERE_API_KEY: required("COHERE_API_KEY")
});

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}
