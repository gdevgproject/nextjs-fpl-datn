import { z } from "zod";

// TypeScript interface for Banner
export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

// Response interface for list of banners
export interface BannersResponse {
  data: Banner[];
  count: number;
}

// Filters interface for banner queries
export interface BannersFilters {
  search?: string;
  isActive?: boolean;
}

// Pagination interface
export interface BannersPagination {
  page: number;
  pageSize: number;
}

// Sort interface
export interface BannersSort {
  column: string;
  direction: "asc" | "desc";
}

// Zod schema for banner creation validation
export const bannerSchema = z
  .object({
    title: z
      .string()
      .min(1, "Tiêu đề không được để trống")
      .max(100, "Tiêu đề không được vượt quá 100 ký tự"),
    subtitle: z
      .string()
      .max(200, "Tiêu đề phụ không được vượt quá 200 ký tự")
      .nullable()
      .optional(),
    image_url: z.string().min(1, "Hình ảnh banner là bắt buộc"),
    link_url: z.string().url("URL không hợp lệ").nullable().optional(),
    is_active: z.boolean().default(true),
    display_order: z
      .number()
      .int()
      .min(0, "Thứ tự hiển thị phải là số nguyên dương"),
    start_date: z.date().nullable().optional(),
    end_date: z.date().nullable().optional(),
  })
  .refine(
    (data) => {
      // If both dates are provided, ensure end_date is after start_date
      if (data.start_date && data.end_date) {
        return data.end_date > data.start_date;
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["end_date"],
    }
  );

// Schema cho việc cập nhật banner (tất cả trường đều là optional)
export const bannerUpdateSchema = z
  .object({
    title: z
      .string()
      .min(1, "Tiêu đề không được để trống")
      .max(100, "Tiêu đề không được vượt quá 100 ký tự")
      .optional(),
    subtitle: z
      .string()
      .max(200, "Tiêu đề phụ không được vượt quá 200 ký tự")
      .nullable()
      .optional(),
    image_url: z.string().min(1, "Hình ảnh banner là bắt buộc").optional(),
    link_url: z.string().url("URL không hợp lệ").nullable().optional(),
    is_active: z.boolean().optional(),
    display_order: z
      .number()
      .int()
      .min(0, "Thứ tự hiển thị phải là số nguyên dương")
      .optional(),
    start_date: z.date().nullable().optional(),
    end_date: z.date().nullable().optional(),
  })
  .refine(
    (data) => {
      // If both dates are provided, ensure end_date is after start_date
      if (data.start_date && data.end_date) {
        return data.end_date > data.start_date;
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["end_date"],
    }
  );

// Data types for mutations
export type CreateBannerData = z.infer<typeof bannerSchema>;
export type UpdateBannerData = Partial<z.infer<typeof bannerSchema>> & {
  id: number;
};

export interface DeleteBannerData {
  id: number;
}

// Types for image uploading
export interface UploadBannerImageOptions {
  file: File;
  path?: string;
  fileOptions?: {
    contentType?: string;
    upsert?: boolean;
  };
  createPathOptions?: {
    fileExtension?: string;
    prefix?: string;
  };
}

export interface UploadBannerImageResult {
  path: string;
  publicUrl: string;
}

export interface DeleteBannerImageOptions {
  path: string;
}
