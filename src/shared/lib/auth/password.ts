import "server-only";

import { compare, hash } from "bcryptjs";

const PASSWORD_SALT_ROUNDS = 12;

function hashPassword(password: string) {
  return hash(password, PASSWORD_SALT_ROUNDS);
}

function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export { hashPassword, verifyPassword };
