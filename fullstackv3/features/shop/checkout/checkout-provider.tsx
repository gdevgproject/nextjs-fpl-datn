"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthQuery } from "@/features/auth/hooks";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { securedPlaceOrder } from "./secure-place-order";
import { useCartQuery, useClearCart } from "@/features/shop/cart/use-cart";
import { validateDiscountCode } from "@/features/shop/cart/cart-actions";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import type { Address } from "@/features/shop/account/types";
import type { CartItem } from "@/features/shop/cart/types";

// Checkout steps
type CheckoutStep = "address" | "payment" | "review";

// Form data type
interface CheckoutFormData {
  // Guest info
  fullName?: string;
  email?: string;
  phoneNumber?: string;

  // Address
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  deliveryNotes?: string;
  paymentMethodId?: number;
}

// Context type
interface CheckoutContextType {
  currentStep: CheckoutStep;
  formData: CheckoutFormData;
  errors: Record<string, string>;
  isProcessing: boolean;
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: CheckoutStep) => void;
  placeOrderHandler: () => Promise<void>;
  validateCurrentStep: () => boolean;
  justPlacedOrder: boolean;
  setJustPlacedOrder: (value: boolean) => void;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountInfo: { discount: any; discountAmount: number } | null;
  discountAmount: number;
  appliedDiscount: any;
}

// Create context
const CheckoutContext = createContext<CheckoutContextType>({
  currentStep: "address",
  formData: {},
  errors: {},
  isProcessing: false,
  updateFormData: () => {},
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  goToStep: () => {},
  placeOrderHandler: async () => {},
  validateCurrentStep: () => false,
  justPlacedOrder: false,
  setJustPlacedOrder: () => {},
  discountCode: "",
  setDiscountCode: () => {},
  discountInfo: null,
  discountAmount: 0,
  appliedDiscount: null,
});

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useSonnerToast();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;

  // Use the new cart query hook
  const {
    data: cartItems = [],
    isLoading: cartLoading,
    error: cartError,
  } = useCartQuery();
  const { mutateAsync: clearCart } = useClearCart();
  const { settings } = useShopSettings();

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [formData, setFormData] = useState<CheckoutFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [justPlacedOrder, setJustPlacedOrder] = useState(false);

  // Discount state
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{
    discount: any;
    discountAmount: number;
  } | null>(null);

  // Compute subtotal & totals
  const shippingFee = settings?.default_shipping_fee ?? 0;
  const subtotal = useMemo((): number => {
    return cartItems.reduce((sum: number, item: CartItem) => {
      const price = item.product?.salePrice ?? item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const saleDiscount = useMemo((): number => {
    return cartItems.reduce((sum: number, item: CartItem) => {
      const full = item.product?.price ?? 0;
      const sale = item.product?.salePrice ?? full;
      return sum + (full - sale) * item.quantity;
    }, 0);
  }, [cartItems]);

  const discountAmount = discountInfo?.discountAmount ?? 0;
  const appliedDiscount = discountInfo?.discount ?? null;

  const cartTotal =
    Math.max(0, subtotal - saleDiscount - discountAmount) + shippingFee;

  // Initialize discount from URL
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      (async () => {
        const result = await validateDiscountCode(code, subtotal);
        if (result.success && result.data) {
          setDiscountCode(code);
          setDiscountInfo(result.data);
        }
      })();
    }
  }, [searchParams, subtotal]);

  // Reset checkout when user logs out
  useEffect(() => {
    if (!session?.user) {
      setCurrentStep("address");
      setFormData({});
      setErrors({});
      setDiscountCode("");
      setDiscountInfo(null);
      setJustPlacedOrder(false);
    }
  }, [session]);

  // Update form data
  const updateFormData = (data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));

    // Clear errors for updated fields
    const updatedErrors = { ...errors };
    Object.keys(data).forEach((key) => {
      if (updatedErrors[key]) {
        delete updatedErrors[key];
      }
    });
    setErrors(updatedErrors);
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === "address") {
      // Validate guest info for non-authenticated users
      if (!isAuthenticated) {
        if (!formData.fullName?.trim()) {
          newErrors.fullName = "Vui lòng nhập họ tên";
        }

        if (
          formData.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
          newErrors.email = "Email không hợp lệ";
        }

        if (!formData.phoneNumber?.trim()) {
          newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
        } else if (
          !/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phoneNumber)
        ) {
          newErrors.phoneNumber = "Số điện thoại không hợp lệ";
        }
      }

      // Validate address fields
      if (!formData.address?.trim()) {
        newErrors.address = "Vui lòng nhập địa chỉ";
      }

      if (!formData.province?.trim()) {
        newErrors.province = "Vui lòng nhập tỉnh/thành phố";
      }

      if (!formData.district?.trim()) {
        newErrors.district = "Vui lòng nhập quận/huyện";
      }

      if (!formData.ward?.trim()) {
        newErrors.ward = "Vui lòng nhập phường/xã";
      }
    } else if (currentStep === "payment") {
      // Validate payment method
      if (!formData.paymentMethodId) {
        newErrors.paymentMethodId = "Vui lòng chọn phương thức thanh toán";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Go to next step
  const goToNextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === "address") {
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("review");
    }
  };

  // Go to previous step
  const goToPreviousStep = () => {
    if (currentStep === "payment") {
      setCurrentStep("address");
    } else if (currentStep === "review") {
      setCurrentStep("payment");
    }
  };

  // Go to specific step
  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  // Place order using our new secure implementation
  const placeOrderHandler = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (cartItems.length === 0) {
      toast("Giỏ hàng trống", {
        description:
          "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.",
      });
      router.push("/gio-hang");
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare shipping address matching Address type
      const shippingAddress: Address = {
        id: 0,
        user_id: session?.user?.id || "",
        recipient_name: formData.fullName || "",
        recipient_phone: formData.phoneNumber || "",
        province_city: formData.province || "",
        district: formData.district || "",
        ward: formData.ward || "",
        street_address: formData.address || "",
        is_default: false,
      };

      // Prepare guest info if not authenticated
      const guestInfo = !isAuthenticated
        ? {
            name: formData.fullName || "",
            email: formData.email || "",
            phone: formData.phoneNumber || "",
          }
        : null;

      // Place order using the secured transaction method that bypasses RLS
      const result = await securedPlaceOrder({
        shippingAddress,
        paymentMethodId: formData.paymentMethodId || 1,
        deliveryNotes: formData.deliveryNotes,
        discountId: appliedDiscount?.id,
        cartItems,
        subtotal,
        discountAmount,
        shippingFee,
        total: cartTotal,
        guestInfo,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast("Đặt hàng thành công", {
        description: "Đơn hàng của bạn đã được tiếp nhận!",
      });

      // Clear cart after successful order
      // For authenticated users, this was already done in the server action
      // For guest users, clear localStorage
      if (!isAuthenticated) {
        await clearCart();
      }

      // Redirect to order confirmation page
      if (!isAuthenticated && result.accessToken) {
        // For guest users, use the access token for security
        router.push(`/xac-nhan-don-hang?token=${result.accessToken}`);
      } else {
        // For authenticated users, the orderId is sufficient due to RLS
        router.push(`/xac-nhan-don-hang?orderId=${result.orderId}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast("Đặt hàng thất bại", {
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
      });
    } finally {
      setIsProcessing(false);
      setJustPlacedOrder(true);
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        currentStep,
        formData,
        errors,
        isProcessing,
        updateFormData,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        placeOrderHandler,
        validateCurrentStep,
        justPlacedOrder,
        setJustPlacedOrder,
        discountCode,
        setDiscountCode,
        discountInfo,
        discountAmount,
        appliedDiscount,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => useContext(CheckoutContext);
