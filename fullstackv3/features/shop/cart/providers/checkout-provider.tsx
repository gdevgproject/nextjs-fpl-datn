"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartContext } from "./cart-provider";
import { useAuthQuery } from "@/features/auth/hooks";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { securedPlaceOrder } from "../actions/secure-place-order";
import type { Address } from "@/features/shop/account/types";

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
  paymentMethod?: number;
}

// Payment Method Type
interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

// Context type
interface CheckoutContextType {
  currentStep: CheckoutStep;
  formData: CheckoutFormData;
  errors: Record<string, string>;
  isProcessing: boolean;
  paymentMethods: PaymentMethod[];
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: CheckoutStep) => void;
  placeOrderHandler: () => Promise<void>;
  validateCurrentStep: () => boolean;
  justPlacedOrder: boolean;
  setJustPlacedOrder: (value: boolean) => void;
}

// Create context
const CheckoutContext = createContext<CheckoutContextType>({
  currentStep: "address",
  formData: {},
  errors: {},
  isProcessing: false,
  paymentMethods: [],
  updateFormData: () => {},
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  goToStep: () => {},
  placeOrderHandler: async () => {},
  validateCurrentStep: () => false,
  justPlacedOrder: false,
  setJustPlacedOrder: () => {},
});

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const {
    cartItems,
    subtotal,
    discount,
    shippingFee,
    cartTotal,
    appliedDiscount,
    clearCart,
  } = useCartContext();

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [formData, setFormData] = useState<CheckoutFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [justPlacedOrder, setJustPlacedOrder] = useState(false);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching payment methods:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải phương thức thanh toán",
          variant: "destructive",
        });
      } else {
        setPaymentMethods(data || []);
      }
    };

    fetchPaymentMethods();
  }, [toast]);

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
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
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
      toast({
        title: "Giỏ hàng trống",
        description:
          "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.",
        variant: "destructive",
      });
      router.push("/gio-hang");
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare shipping address
      const shippingAddress: Address = {
        id: 0, // Temporary ID for guest
        user_id: "", // Will be filled for authenticated users
        recipient_name: formData.fullName || "",
        phone: formData.phoneNumber || "",
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
        paymentMethodId: formData.paymentMethod || 1, // Default to COD if not selected
        deliveryNotes: formData.deliveryNotes,
        discountId: appliedDiscount?.id,
        cartItems,
        subtotal,
        discountAmount: discount,
        shippingFee,
        total: cartTotal,
        guestInfo,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Show success notification for everyone (guest and logged-in users)
      toast({
        title: "Đặt hàng thành công",
        description: "Đơn hàng của bạn đã được tiếp nhận!",
        variant: "success",
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
      toast({
        title: "Đặt hàng thất bại",
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
        variant: "destructive",
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
        paymentMethods,
        updateFormData,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        placeOrderHandler,
        validateCurrentStep,
        justPlacedOrder,
        setJustPlacedOrder,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => useContext(CheckoutContext);
