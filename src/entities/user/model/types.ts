type UserRole = "ADMIN" | "USER";

type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  user: User;
};

export type { AuthResponse, User, UserRole };
