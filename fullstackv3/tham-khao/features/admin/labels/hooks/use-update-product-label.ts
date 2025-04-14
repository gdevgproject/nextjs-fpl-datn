import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateProductLabel() {
  return useClientMutation("product_labels", "update", {
    invalidateQueries: [["product_labels", "list"]],
    primaryKey: "id",
  })
}
