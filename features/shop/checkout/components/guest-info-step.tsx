"use client";

import { useState, useEffect } from "react";
import { useCheckout } from "@/features/shop/checkout/checkout-provider";
import { guestInfoSchema } from "../validators";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function GuestInfoStep() {
  const { formData, updateFormData, errors } = useCheckout();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({
    fullName: false,
    email: false,
    phoneNumber: false,
  });

  const handleChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validate form data with Zod on change
  useEffect(() => {
    const result = guestInfoSchema.safeParse({
      fullName: formData.fullName || "",
      email: formData.email || "",
      phoneNumber: formData.phoneNumber || "",
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        fieldErrors[key] = err.message;
      });
      setLocalErrors(fieldErrors);
    } else {
      setLocalErrors({});
    }
  }, [formData.fullName, formData.email, formData.phoneNumber]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Thông tin liên hệ</CardTitle>
        <CardDescription>
          Vui lòng cung cấp thông tin để chúng tôi liên hệ khi cần
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Nguyễn Văn A"
              value={formData.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            {touched.fullName && (errors.fullName || localErrors.fullName) && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.fullName || localErrors.fullName}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Email (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (tùy chọn)</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {touched.email && localErrors.email && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{localErrors.email}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Số điện thoại <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phoneNumber"
              placeholder="0912345678"
              value={formData.phoneNumber || ""}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
            />
            {touched.phoneNumber &&
              (errors.phoneNumber || localErrors.phoneNumber) && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.phoneNumber || localErrors.phoneNumber}
                  </AlertDescription>
                </Alert>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
