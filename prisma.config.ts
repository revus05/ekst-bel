import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.STORAGE_PRISMA_DATABASE_URL ?? "",
  },
  migrations: {
    seed: "bun run prisma/seed.ts",
  },
});
