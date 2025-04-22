import { z } from "zod";

// Types for user management
export interface UserExtended {
  id: string;
  email: string;
  display_name?: string | null;
  phone_number?: string | null;
  role: string;
  is_blocked: boolean;
  created_at: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  avatar_url?: string | null;
  addresses?: UserAddress[];
}

export interface UserAddress {
  id: number;
  recipient_name: string;
  recipient_phone: string;
  province_city: string;
  district: string;
  ward: string;
  street_address: string;
  postal_code?: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

// Filter schema for users
export const UserFilterSchema = z.object({
  search: z.string().optional(),
  role: z.enum(["all", "user", "admin", "staff", "shipper"]).default("all"),
  status: z.enum(["all", "active", "blocked"]).default("all"),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().default(10),
});

export type UserFilter = z.infer<typeof UserFilterSchema>;

// Schema for role update
export const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin", "staff", "shipper"]),
});

export type UpdateUserRole = z.infer<typeof UpdateUserRoleSchema>;

// Schema for block/unblock
export const UpdateUserBlockStatusSchema = z.object({
  userId: z.string().uuid(),
  isBlocked: z.boolean(),
});

export type UpdateUserBlockStatus = z.infer<typeof UpdateUserBlockStatusSchema>;
