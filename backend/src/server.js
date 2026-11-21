import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { config } from "./config/env.js";

/** Connects to MongoDB before accepting HTTP requests. */
async function startServer() {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`Downbot API listening on port ${config.port}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exitCode = 1;
});
