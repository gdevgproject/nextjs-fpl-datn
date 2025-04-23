"use client";

// Re-export the payment methods hook from the payment-methods feature
// This follows the dev-guide.txt recommendation for code reuse while maintaining feature boundaries
export { usePaymentMethods } from "../../payment-methods/hooks/use-payment-methods";
