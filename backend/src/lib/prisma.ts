import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === "production" ? ["error"] : ["query", "error"],
    transactionOptions: {
      maxWait: 5000,
      timeout: 60000
    }
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
