import type { User as PrismaUser } from "@prisma/client";

import type { User } from "entities/user/model/types";

function serializeUser(
  user: Pick<PrismaUser, "id" | "email" | "name" | "createdAt" | "updatedAt">,
): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export { serializeUser };
