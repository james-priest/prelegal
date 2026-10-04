/** Account API: sign up, sign in, sign out and the current user. */

import { api } from "@/lib/api";

export interface User {
  id: number;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export const MIN_PASSWORD_LENGTH = 8;

export const signUp = (credentials: Credentials) => api<User>("/api/auth/signup", { method: "POST", body: credentials });

export const signIn = (credentials: Credentials) => api<User>("/api/auth/signin", { method: "POST", body: credentials });

export const signOut = () => api<void>("/api/auth/signout", { method: "POST" });

export const fetchCurrentUser = () => api<User>("/api/auth/me");
