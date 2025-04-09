"use client";

import type React from "react";
import type { User, AuthError } from "@supabase/supabase-js";
import { createClient } from "@/shared/supabase/client";
import { createContext, useContext, useCallback, useState } from "react";
import { useClientFetch } from "@/shared/hooks/use-client-fetch";
import { useQueryClient } from "@tanstack/react-query";
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast";

// Supabase client
const supabase = createClient();

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  isStaff: boolean;
  isShipper: boolean;
  login: (email: string, password: string) => Promise<{ error?: AuthError }>;
  register: (data: RegisterData) => Promise<{ error?: AuthError; user?: User }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Register data type
interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user data with useClientFetch
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useClientFetch(
    ["user"],
    "profiles",
    {
      enabled: false, // We'll manually trigger this with the getUser call below
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    {
      queryFn: async () => {
        const { data } = await supabase.auth.getUser();
        return data?.user ?? null;
      },
    }
  );

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!result.error) {
          // Invalidate user query to refresh user data
          queryClient.invalidateQueries({ queryKey: ["user"] });

          // Don't show toast here - let the login form handle it
        }

        return { error: result.error };
      } catch (error) {
        console.error("Login error:", error);
        return { error: error as AuthError };
      }
    },
    [queryClient]
  );

  // Register function
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        // Register the user with Supabase Auth
        const result = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              display_name: data.name,
              phone_number: data.phone || null,
            },
          },
        });

        if (result.error) {
          return { error: result.error };
        }

        // The profile will be created automatically via the database trigger
        // when a new user is added to auth.users

        // Invalidate user query to refresh user data
        queryClient.invalidateQueries({ queryKey: ["user"] });

        return { user: result.data.user };
      } catch (error) {
        console.error("Registration error:", error);
        return { error: error as AuthError };
      }
    },
    [queryClient]
  );

  // Logout function
  const logout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(`Đăng xuất thất bại: ${error.message}`);
        return;
      }

      // Clear user data from query cache
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Also clear cart data
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      // Don't show toast here - let the component handle it
    } catch (error) {
      toast.error(
        `Đăng xuất thất bại: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoggingOut(false);
    }
  }, [queryClient, toast, isLoggingOut]);

  // Refresh user function
  const refreshUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Check user roles
  const userRole = user?.app_metadata?.role || "authenticated";
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "admin" || userRole === "staff";
  const isShipper = userRole === "shipper";

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error: error as Error | null,
        isAdmin,
        isStaff,
        isShipper,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
