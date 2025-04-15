import type { Profile } from "../account/types";

/**
 * Review from the reviews table
 */
export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  order_item_id?: number | null;
  rating: number;
  comment?: string | null;
  is_approved: boolean;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // Expanded data (optional, for frontend use)
  user_profile?: Profile;
  replies?: ReviewReply[];
}

/**
 * Review reply from the review_replies table
 */
export interface ReviewReply {
  id: number;
  review_id: number;
  staff_id: string;
  reply_text: string;
  created_at?: string;
  updated_at?: string;
  // Expanded data (optional, for frontend use)
  staff_profile?: Profile;
}
