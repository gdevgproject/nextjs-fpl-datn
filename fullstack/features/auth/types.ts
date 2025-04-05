import type { z } from "zod";
import type {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./validators";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../account/types";

/**
 * Login form values
 */
export type LoginFormValues = z.infer<typeof loginSchema> & {
  rememberMe?: boolean;
};

/**
 * Register form values
 */
export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Forgot password form values
 */
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password form values
 */
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Authentication response
 */
export interface AuthResponse {
  success: boolean;
  error?: string;
  code?: string;
  data?: any;
  emailConfirmation?: boolean;
}

/**
 * User role
 */
export type UserRole = "anon" | "authenticated" | "staff" | "admin";

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: Profile | null;
  error: Error | null;
}
