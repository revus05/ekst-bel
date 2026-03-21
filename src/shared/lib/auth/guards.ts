import "server-only";

import type { User } from "entities/user/model/types";

function isAdmin(user: User | null): user is User & { role: "ADMIN" } {
  return user?.role === "ADMIN";
}

export { isAdmin };
