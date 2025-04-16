"use client";

import { useCheckout } from "@/features/shop/checkout/checkout-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Landmark, Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define PaymentMethod type based on your database schema
interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export function PaymentStep() {
  const { formData, updateFormData, paymentMethods, goToNextStep } = useCheckout();

  // Handle payment method selection
  const handlePaymentMethodChange = (paymentMethodId: number) => {
    updateFormData({ paymentMethod: paymentMethodId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phương thức thanh toán</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <RadioGroup
          value={formData.paymentMethod?.toString() || ""}
          onValueChange={(value) => handlePaymentMethodChange(Number(value))}
          className="space-y-3"
        >
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-start space-x-3 border p-3 rounded-md"
            >
              <RadioGroupItem
                value={method.id.toString()}
                id={`payment-${method.id}`}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor={`payment-${method.id}`}
                  className="font-medium cursor-pointer flex items-center"
                >
                  {method.id === 1 && <Wallet className="h-4 w-4 mr-2" />}
                  {method.id === 2 && <Landmark className="h-4 w-4 mr-2" />}
                  {method.id === 3 && <CreditCard className="h-4 w-4 mr-2" />}
                  {method.id === 4 && <CreditCard className="h-4 w-4 mr-2" />}
                  {method.id === 5 && <CreditCard className="h-4 w-4 mr-2" />}
                  {method.id === 7 && <Landmark className="h-4 w-4 mr-2" />}
                  {method.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {method.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        {/* Show bank details if payment method is bank transfer */}
        {formData.paymentMethod === 2 || formData.paymentMethod === 7 ? (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Thông tin chuyển khoản:</p>
            <div className="mt-2 text-sm">
              <p>
                Ngân hàng:{" "}
                <span className="font-medium">
                  BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam
                </span>
              </p>
              <p>
                Số tài khoản: <span className="font-medium">1234567890</span>
              </p>
              <p>
                Chủ tài khoản:{" "}
                <span className="font-medium">CÔNG TY TNHH MYBEAUTY</span>
              </p>
              <p>
                Nội dung:{" "}
                <span className="font-medium">
                  Thanh toan [Họ tên] [Số điện thoại]
                </span>
              </p>
            </div>
          </div>
        ) : null}

        {/* Order Note */}
        <Textarea
          placeholder="Nhập ghi chú đơn hàng (không bắt buộc)"
          className="min-h-[100px]"
          value={formData.deliveryNotes || ""}
          onChange={(e) => updateFormData({ deliveryNotes: e.target.value })}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={goToNextStep}>Tiếp tục</Button>
      </CardFooter>
    </Card>
  );
}
