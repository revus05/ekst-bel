import { PrismaClient } from "@prisma/client";

import { env } from "@/shared/config/env";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  if (!env.DATABASE_URL) {
    console.error(
      "[db] Prisma client is starting without a valid DATABASE_URL.",
    );
  }

  return new PrismaClient(
    env.DATABASE_URL
      ? {
          datasources: {
            db: {
              url: env.DATABASE_URL,
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
