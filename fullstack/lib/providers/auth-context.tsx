"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/features/account/types";
import { handleApiError } from "../utils/error-utils";
import { getUserRoleFromMetadata } from "../utils/auth-utils";
import type { UserRole } from "@/features/auth/types";
import { DEFAULT_AVATAR_URL } from "../constants";
import { QUERY_STALE_TIME } from "../hooks/use-query-config";

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  profileImageUrl: string;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  updateProfile: (
    data: Partial<Profile>
  ) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  profileImageUrl: DEFAULT_AVATAR_URL,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  role: "anon",
  signOut: async () => {},
  refreshProfile: async () => null,
  updateProfile: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Thêm state để theo dõi xem component đã mounted chưa
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    role: "anon",
  });

  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Sử dụng React Query để fetch profile data
  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", state.user?.id],
    queryFn: async () => {
      if (!state.user) return null;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", state.user.id)
          .single();

        if (error) throw error;

        return data as Profile;
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw new Error(handleApiError(error));
      }
    },
    enabled: !!state.user && mounted, // Chỉ fetch khi đã mounted
    staleTime: QUERY_STALE_TIME.USER, // Sử dụng staleTime từ config
    gcTime: QUERY_STALE_TIME.USER * 2, // Giữ cache lâu hơn staleTime
    refetchOnWindowFocus: true, // Refetch khi focus lại window
    refetchOnMount: true, // Luôn refetch khi component được mount
  });

  // Tính toán profileImageUrl từ profile
  const profileImageUrl = useMemo(() => {
    return profile?.avatar_url || DEFAULT_AVATAR_URL;
  }, [profile]);

  // Fetch user session
  const fetchUserData = useCallback(async () => {
    if (!mounted) return; // Chỉ fetch khi đã mounted

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Xác định role từ app_metadata
        const role = getUserRoleFromMetadata(session.user);

        setState({
          user: session.user,
          session,
          isLoading: false,
          isAuthenticated: true,
          role,
        });

        // Fetch profile data ngay lập tức
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!profileError && profileData) {
            // Cập nhật cache React Query với profile data
            queryClient.setQueryData(["profile", session.user.id], profileData);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          role: "anon",
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [supabase, queryClient, mounted]);

  // Đánh dấu component đã mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!mounted) return; // Chỉ fetch khi đã mounted

    let isMounted = true;

    const initAuth = async () => {
      await fetchUserData();
    };

    initAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log("Auth state changed:", event, session?.user?.id);

      if (session?.user) {
        // Determine role from app_metadata
        const role = getUserRoleFromMetadata(session.user);

        // Update state immediately for UI to react quickly
        setState({
          user: session.user,
          session,
          isLoading: false,
          isAuthenticated: true,
          role,
        });

        // Prefetch profile data to have it ready in cache
        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (!profileError && profileData) {
              // Update React Query cache with profile data
              queryClient.setQueryData(
                ["profile", session.user.id],
                profileData
              );

              // Force refresh to ensure UI is updated
              queryClient.invalidateQueries({
                queryKey: ["profile", session.user.id],
                refetchType: "all",
              });
            }
          } catch (error) {
            console.error("Error prefetching profile:", error);
          }
        }
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          role: "anon",
        });

        // Clear profile data from cache
        queryClient.removeQueries({ queryKey: ["profile"] });
      }
    });

    // Xử lý đồng bộ giữa các tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.includes("supabase.auth.token")) {
        fetchUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [supabase, queryClient, fetchUserData, mounted]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        role: "anon",
      });

      // Clear user-related queries
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["addresses"] });
      queryClient.removeQueries({ queryKey: ["orders"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      queryClient.removeQueries({ queryKey: ["wishlist"] });

      // Force refresh page để đảm bảo UI được cập nhật
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [supabase, queryClient]);

  // Improved refreshProfile function with broader cache invalidation
  const refreshProfile = useCallback(
    async (broadcastUpdate = true) => {
      if (!state.user) return null;

      try {
        // Add cache-busting with fresh fetch
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", state.user.id)
          .single();

        if (error) {
          console.error("Error refreshing profile:", error);
          throw error;
        }

        // Immediately update React Query cache with new profile data
        queryClient.setQueryData(["profile", state.user.id], data);

        // Force a global re-fetch of profile data if broadcastUpdate is true
        if (broadcastUpdate) {
          await queryClient.invalidateQueries({
            queryKey: ["profile", state.user.id],
            refetchType: "all",
          });

          // Also invalidate any related queries that might depend on profile data
          queryClient.invalidateQueries({
            queryKey: ["addresses", state.user.id],
          });
          queryClient.invalidateQueries({ queryKey: ["user-settings"] });

          // Force refetch of any active profile queries to ensure UI updates
          queryClient.refetchQueries({
            queryKey: ["profile", state.user.id],
            type: "active",
          });
        }

        return data as Profile;
      } catch (error) {
        console.error("Error refreshing profile:", error);

        // Trigger a re-fetch to possibly recover from the error
        refetch().catch((refetchError) => {
          console.error(
            "Error during refetch after refresh failure:",
            refetchError
          );
        });

        return null;
      }
    },
    [state.user, supabase, queryClient, refetch]
  );

  // Enhanced update profile function with optimistic updates
  const updateProfile = async (data: Partial<Profile>) => {
    if (!state.user)
      return { success: false, error: "Không có người dùng đăng nhập" };

    try {
      // Get current profile before update for optimistic updates
      const currentProfile = queryClient.getQueryData<Profile>([
        "profile",
        state.user.id,
      ]);

      // Apply optimistic update immediately
      if (currentProfile) {
        queryClient.setQueryData(["profile", state.user.id], {
          ...currentProfile,
          ...data,
          // Add temporary flag to indicate this is an optimistic update
          _optimisticUpdate: true,
        });
      }

      // Perform the actual update
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", state.user.id);

      if (error) throw error;

      // Fetch the latest data after successful update
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", state.user.id)
        .single();

      if (fetchError) {
        console.warn(
          "Failed to fetch updated profile, using optimistic data",
          fetchError
        );
      } else if (updatedProfile) {
        // Update cache with actual server data
        queryClient.setQueryData(["profile", state.user.id], updatedProfile);
      }

      // Force invalidate to ensure all components re-render with the new data
      queryClient.invalidateQueries({
        queryKey: ["profile", state.user.id],
        refetchType: "all",
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);

      // Revert optimistic update if there's an error
      if (state.user) {
        refreshProfile(false).then(() => {
          queryClient.invalidateQueries({
            queryKey: ["profile", state.user.id],
            refetchType: "all",
          });
        });
      }

      return { success: false, error: handleApiError(error) };
    }
  };

  // Tạo context value
  const value: AuthContextType = useMemo(
    () => ({
      ...state,
      profile: profile || null,
      profileImageUrl,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [state, profile, profileImageUrl, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
