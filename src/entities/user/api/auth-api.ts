import type { AuthResponse } from "entities/user/model/types";
import { apiClient } from "shared/api/api-client";
import type { ApiResponse } from "shared/api/contracts";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

async function loginUser(payload: LoginPayload) {
  const response = await apiClient.post<
    ApiResponse<AuthResponse, keyof LoginPayload>,
    LoginPayload
  >("/api/auth/login", payload);

  if (!response.success) {
    throw new Error("Unexpected API error shape.");
  }

  return response.data;
}

async function registerUser(payload: RegisterPayload) {
  const response = await apiClient.post<
    ApiResponse<AuthResponse, keyof RegisterPayload>,
    RegisterPayload
  >("/api/auth/register", payload);

  if (!response.success) {
    throw new Error("Unexpected API error shape.");
  }

  return response.data;
}

async function getCurrentUserProfile() {
  const response =
    await apiClient.get<ApiResponse<AuthResponse>>("/api/auth/me");

  if (!response.success) {
    throw new Error("Unexpected API error shape.");
  }

  return response.data;
}

async function logoutUser() {
  await apiClient.post<ApiResponse<{ success: true }>>("/api/auth/logout");
}

export type { LoginPayload, RegisterPayload };
export { getCurrentUserProfile, loginUser, logoutUser, registerUser };
