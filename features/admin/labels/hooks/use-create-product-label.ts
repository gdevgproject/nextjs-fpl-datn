import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreateProductLabel() {
  return useClientMutation("product_labels", "insert", {
    invalidateQueries: [["product_labels", "list"]],
    primaryKey: "id",
  })
}
