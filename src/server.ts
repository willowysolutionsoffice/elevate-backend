import "dotenv/config";
import app from "./app";
import { env } from "./config/env.config";
import { prisma } from "./lib/prisma";

async function startServer() {
  try {
    console.log("Database connected");

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();

const shutdown = async () => {
  console.log("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
