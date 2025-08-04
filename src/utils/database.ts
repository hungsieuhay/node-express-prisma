import { PrismaClient } from "@prisma/client";

// Create a global variable to store the Prisma client
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client instance
const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In development, store the client in global to prevent multiple instances
if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = prisma;
}

export { prisma };

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
