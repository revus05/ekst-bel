import { PrismaClient } from "@prisma/client";

import { env } from "shared/config/env";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  if (!env.STORAGE_PRISMA_DATABASE_URL) {
    console.error(
      "[db] Prisma client is starting without a valid STORAGE_PRISMA_DATABASE_URL.",
    );
  }

  return new PrismaClient(
    env.STORAGE_PRISMA_DATABASE_URL
      ? {
          datasources: {
            db: {
              url: env.STORAGE_PRISMA_DATABASE_URL,
            },
          },
        }
      : undefined,
  );
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
