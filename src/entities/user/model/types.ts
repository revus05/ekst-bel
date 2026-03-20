type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  user: User;
};

export type { AuthResponse, User };
