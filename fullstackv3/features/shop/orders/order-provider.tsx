"use client";

import type React from "react";
import { createContext, useContext, useState, useMemo } from "react";
import { useAuthQuery, useProfileQuery } from "@/features/auth/hooks";
import { useCartContext } from "@/features/shop/cart/cart-provider";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { useRouter } from "next/navigation";
import type { Address } from "@/features/shop/account/types";

// Định nghĩa các bước trong quy trình thanh toán
type CheckoutStep = "cart" | "address" | "payment" | "review" | "complete";

// Định nghĩa thông tin đơn hàng
type OrderInfo = {
  shippingAddress: Address | null;
  paymentMethod: string | null;
  deliveryNotes: string;
  discountCode: string | null;
};

// Định nghĩa context type
type OrderContextType = {
  currentStep: CheckoutStep;
  orderInfo: OrderInfo;
  isProcessing: boolean;
  setStep: (step: CheckoutStep) => void;
  setShippingAddress: (address: Address) => void;
  setPaymentMethod: (method: string) => void;
  setDeliveryNotes: (notes: string) => void;
  setDiscountCode: (code: string | null) => void;
  placeOrder: () => Promise<boolean>;
  resetOrder: () => void;
};

// Tạo context
const OrderContext = createContext<OrderContextType>({
  currentStep: "cart",
  orderInfo: {
    shippingAddress: null,
    paymentMethod: null,
    deliveryNotes: "",
    discountCode: null,
  },
  isProcessing: false,
  setStep: () => {},
  setShippingAddress: () => {},
  setPaymentMethod: () => {},
  setDeliveryNotes: () => {},
  setDiscountCode: () => {},
  placeOrder: async () => false,
  resetOrder: () => {},
});

// Hook để sử dụng context
export const useOrderContext = () => useContext(OrderContext);

// Provider component
export function OrderProvider({ children }: { children: React.ReactNode }) {
  // Lấy session và profile từ hooks mới
  const { data: session } = useAuthQuery();
  const user = session?.user || null;
  const { data: profile } = useProfileQuery(user?.id);
  const { cartItems, cartTotal, subtotal, discount, shippingFee, clearCart } =
    useCartContext();
  const { toast } = useSonnerToast();
  const router = useRouter();

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    shippingAddress: null,
    paymentMethod: null,
    deliveryNotes: "",
    discountCode: null,
  });

  // Các hàm setter
  const setStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const setShippingAddress = (address: Address) => {
    setOrderInfo((prev) => ({ ...prev, shippingAddress: address }));
  };

  const setPaymentMethod = (method: string) => {
    setOrderInfo((prev) => ({ ...prev, paymentMethod: method }));
  };

  const setDeliveryNotes = (notes: string) => {
    setOrderInfo((prev) => ({ ...prev, deliveryNotes: notes }));
  };

  const setDiscountCode = (code: string | null) => {
    setOrderInfo((prev) => ({ ...prev, discountCode: code }));
  };

  // Đặt hàng
  const placeOrder = async (): Promise<boolean> => {
    // Kiểm tra thông tin đơn hàng
    if (!orderInfo.shippingAddress) {
      toast("Lỗi", { description: "Vui lòng chọn địa chỉ giao hàng" });
      return false;
    }

    if (!orderInfo.paymentMethod) {
      toast("Lỗi", { description: "Vui lòng chọn phương thức thanh toán" });
      return false;
    }

    if (cartItems.length === 0) {
      toast("Lỗi", { description: "Giỏ hàng của bạn đang trống" });
      return false;
    }

    setIsProcessing(true);

    try {
      // Giả lập API call để tạo đơn hàng
      // Trong thực tế, cần gọi API để tạo đơn hàng
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Xóa giỏ hàng sau khi đặt hàng thành công
      clearCart();

      // Chuyển đến bước hoàn thành
      setCurrentStep("complete");

      toast("Đặt hàng thành công", {
        description: "Cảm ơn bạn đã mua hàng tại MyBeauty",
      });

      // Chuyển hướng đến trang xác nhận đơn hàng
      router.push("/xac-nhan-don-hang");

      return true;
    } catch (error) {
      toast("Đặt hàng thất bại", {
        description: "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset đơn hàng
  const resetOrder = () => {
    setCurrentStep("cart");
    setOrderInfo({
      shippingAddress: null,
      paymentMethod: null,
      deliveryNotes: "",
      discountCode: null,
    });
  };

  const value = useMemo(
    () => ({
      currentStep,
      orderInfo,
      isProcessing,
      setStep,
      setShippingAddress,
      setPaymentMethod,
      setDeliveryNotes,
      setDiscountCode,
      placeOrder,
      resetOrder,
    }),
    [currentStep, orderInfo, isProcessing]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}
