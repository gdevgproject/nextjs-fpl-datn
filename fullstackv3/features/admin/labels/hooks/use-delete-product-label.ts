import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useDeleteProductLabel() {
  return useClientMutation("product_labels", "delete", {
    invalidateQueries: [["product_labels", "list"]],
    primaryKey: "id",
  })
}
