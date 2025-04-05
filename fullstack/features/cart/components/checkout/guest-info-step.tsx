"use client"

import { useState } from "react"
import { useCheckout } from "../../providers/checkout-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function GuestInfoStep() {
  const { formData, updateFormData, errors } = useCheckout()
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    // Clear error when user types
    if (localErrors[field]) {
      setLocalErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    updateFormData({ [field]: value })
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    // Simple Vietnamese phone number validation
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
    return phoneRegex.test(phone)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Thông tin liên hệ</CardTitle>
        <CardDescription>Vui lòng cung cấp thông tin để chúng tôi liên hệ khi cần</CardDescription>
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
            {(errors.fullName || localErrors.fullName) && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.fullName || localErrors.fullName}</AlertDescription>
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
              onChange={(e) => {
                const value = e.target.value
                handleChange("email", value)

                // Validate email format
                if (value && !validateEmail(value)) {
                  setLocalErrors((prev) => ({
                    ...prev,
                    email: "Email không hợp lệ",
                  }))
                } else {
                  setLocalErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.email
                    return newErrors
                  })
                }
              }}
            />
            {localErrors.email && (
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
              onChange={(e) => {
                const value = e.target.value
                handleChange("phoneNumber", value)

                // Validate phone format
                if (value && !validatePhone(value)) {
                  setLocalErrors((prev) => ({
                    ...prev,
                    phoneNumber: "Số điện thoại không hợp lệ",
                  }))
                } else {
                  setLocalErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.phoneNumber
                    return newErrors
                  })
                }
              }}
            />
            {(errors.phoneNumber || localErrors.phoneNumber) && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.phoneNumber || localErrors.phoneNumber}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

