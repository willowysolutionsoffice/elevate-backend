import "dotenv/config";
import app from "./app";
import { env } from "./config/env.config";
import { prisma } from "./lib/prisma";
import logger from "./utils/logger";

async function startServer() {
  try {
    logger.info("Database connected");

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server");
    logger.error(error);
    process.exit(1);
  }
}

startServer();

const shutdown = async () => {
  logger.info("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
