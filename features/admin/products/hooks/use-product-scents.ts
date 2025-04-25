"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Hook để lấy thông tin nhóm hương cho sản phẩm cụ thể
 */
export function useProductScents(productId: number | null) {
  const toast = useSonnerToast();

  return useQuery<{ data: any[]; count: number | null }>({
    queryKey: ["product_scents", "by_product", productId],
    queryFn: async () => {
      if (!productId) {
        return { data: [], count: 0 }; // Trả về kết quả rỗng nếu không có productId
      }

      try {
        let query = supabase.from("product_scents").select(
          `
            id, 
            product_id,
            scent_id,
            scent:scent_id(id, name, description),
            created_at, 
            updated_at
          `
        );

        query = query.eq("product_id", productId);
        query = query.order("created_at", { ascending: true });

        const { data, error, count } = await query;

        if (error) {
          console.error("Lỗi truy vấn nhóm hương:", error);
          toast.error("Không thể tải dữ liệu nhóm hương", {
            description:
              "Đã xảy ra lỗi khi tải danh sách nhóm hương của sản phẩm",
          });
          return { data: [], count: 0 };
        }

        return { data: data || [], count };
      } catch (error) {
        console.error("Lỗi khi lấy nhóm hương sản phẩm:", error);
        return { data: [], count: 0 };
      }
    },
    enabled: !!productId, // Chỉ gọi API khi có productId
  });
}

/**
 * Hook để thêm nhóm hương vào sản phẩm
 */
export function useAddProductScent() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: { productId: number; scentId: number }) => {
      const { productId, scentId } = payload;

      // Kiểm tra dữ liệu đầu vào
      if (!productId) {
        return { error: "ID sản phẩm không được để trống" };
      }

      if (!scentId) {
        return { error: "ID nhóm hương không được để trống" };
      }

      try {
        // Kiểm tra xem nhóm hương đã được gán cho sản phẩm chưa
        const { data: existingScents, error: checkError } = await supabase
          .from("product_scents")
          .select("id, scent:scent_id(name)")
          .eq("product_id", productId)
          .eq("scent_id", scentId)
          .maybeSingle();

        if (checkError) {
          console.error("Lỗi kiểm tra nhóm hương đã tồn tại:", checkError);
          return { error: "Không thể kiểm tra nhóm hương đã tồn tại" };
        }

        if (existingScents) {
          return {
            error: "duplicate",
            scentName: existingScents.scent?.name,
          };
        }

        // Lấy thông tin nhóm hương để hiển thị trong thông báo thành công
        const { data: scentInfo, error: scentInfoError } = await supabase
          .from("scents")
          .select("name")
          .eq("id", scentId)
          .single();

        if (scentInfoError) {
          console.error("Lỗi lấy thông tin nhóm hương:", scentInfoError);
        }

        // Thêm mới liên kết sản phẩm-nhóm hương
        const { data, error } = await supabase
          .from("product_scents")
          .insert({
            product_id: productId,
            scent_id: scentId,
          })
          .select();

        if (error) {
          console.error("Lỗi thêm nhóm hương:", error);
          return { error: "Không thể thêm nhóm hương cho sản phẩm" };
        }

        return {
          data,
          scentName: scentInfo?.name,
        };
      } catch (error) {
        console.error("Lỗi không xác định:", error);
        return {
          error:
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi thêm nhóm hương",
        };
      }
    },
    onSuccess: (result, variables) => {
      // Kiểm tra kết quả
      if (result.error) {
        if (result.error === "duplicate") {
          toast.warning("Nhóm hương đã tồn tại", {
            description: `Nhóm hương "${
              result.scentName || "này"
            }" đã được gán cho sản phẩm trước đó`,
          });
        } else {
          toast.error("Lỗi thêm nhóm hương", {
            description: result.error,
          });
        }
        return;
      }

      // Cập nhật cache
      queryClient.invalidateQueries({
        queryKey: ["product_scents", "by_product", variables.productId],
      });

      toast.success("Thêm thành công", {
        description: result.scentName
          ? `Đã thêm nhóm hương "${result.scentName}" cho sản phẩm`
          : "Đã thêm nhóm hương cho sản phẩm",
      });
    },
    onError: (error) => {
      console.error("Lỗi thêm nhóm hương:", error);

      toast.error("Lỗi thêm nhóm hương", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể thêm nhóm hương cho sản phẩm",
      });
    },
  });
}

/**
 * Hook để xóa nhóm hương khỏi sản phẩm
 */
export function useRemoveProductScent() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: { id: number; productId: number }) => {
      const { id, productId } = payload;

      // Kiểm tra dữ liệu đầu vào
      if (!id) {
        return { error: "ID liên kết nhóm hương không được để trống" };
      }

      if (!productId) {
        return { error: "ID sản phẩm không được để trống" };
      }

      try {
        // Lấy thông tin nhóm hương trước khi xóa để hiển thị trong thông báo
        const { data: scentData, error: fetchError } = await supabase
          .from("product_scents")
          .select("scent:scent_id(name)")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("Lỗi lấy thông tin nhóm hương:", fetchError);
        }

        const scentName = scentData?.scent?.name;

        // Xóa liên kết sản phẩm-nhóm hương
        const { error } = await supabase
          .from("product_scents")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Lỗi xóa nhóm hương:", error);
          return { error: "Không thể xóa nhóm hương khỏi sản phẩm" };
        }

        return { success: true, id, productId, scentName };
      } catch (error) {
        console.error("Lỗi xóa nhóm hương:", error);
        return {
          error:
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi xóa nhóm hương",
        };
      }
    },
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error("Lỗi xóa nhóm hương", {
          description: result.error,
        });
        return;
      }

      // Cập nhật cache
      queryClient.invalidateQueries({
        queryKey: ["product_scents", "by_product", variables.productId],
      });

      toast.success("Xóa thành công", {
        description: result.scentName
          ? `Đã xóa nhóm hương "${result.scentName}" khỏi sản phẩm`
          : "Đã xóa nhóm hương khỏi sản phẩm",
      });
    },
    onError: (error) => {
      console.error("Lỗi xóa nhóm hương:", error);

      toast.error("Lỗi xóa nhóm hương", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể xóa nhóm hương khỏi sản phẩm",
      });
    },
  });
}
