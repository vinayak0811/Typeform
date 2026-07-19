import { apiClient } from "./api-client";
import type { User } from "@/types";

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post<AuthResponse>("/api/auth/register", data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>("/api/auth/login", data),

  logout: () => apiClient.post<void>("/api/auth/logout"),

  me: () => apiClient.get<User>("/api/auth/me"),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string; debug_reset_token: string | null }>(
      "/api/auth/forgot-password",
      { email }
    ),

  resetPassword: (data: { token: string; new_password: string }) =>
    apiClient.post<void>("/api/auth/reset-password", data),
};
