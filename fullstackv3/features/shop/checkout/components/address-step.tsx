"use client";

import { useState, useEffect } from "react";
import { useCheckout } from "@/features/shop/checkout/checkout-provider";
import { useAuthQuery } from "@/features/auth/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, MapPin, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserAddresses } from "@/features/shop/account/queries";
import { LoaderCircle } from "lucide-react";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

export function AddressStep() {
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id;
  const { formData, updateFormData, errors, goToNextStep } = useCheckout();
  const { toast } = useSonnerToast();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [showAddressForm, setShowAddressForm] = useState(!isAuthenticated);

  // Remove unnecessary initialized state which causes delay in showing content
  const { data: addresses, isLoading } = useUserAddresses(userId);

  // Improved address initialization logic
  useEffect(() => {
    // Handle guest users
    if (!isAuthenticated) {
      setShowAddressForm(true);
      return;
    }

    // If addresses are loaded and we have at least one
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      // Find default address if it exists
      const defaultAddress = addresses.find((addr) => addr.is_default);
      const addressToUse = defaultAddress || addresses[0];

      setSelectedAddressId(addressToUse.id);
      updateFormData({
        fullName: addressToUse.recipient_name,
        phoneNumber: addressToUse.recipient_phone,
        address: addressToUse.street_address,
        province: addressToUse.province_city,
        district: addressToUse.district,
        ward: addressToUse.ward,
      });
      setShowAddressForm(false);
    } else if (addresses && addresses.length === 0) {
      // No addresses found, show the form
      setShowAddressForm(true);
    }
  }, [isAuthenticated, addresses, selectedAddressId, updateFormData]);

  // Handle selecting an address from saved addresses
  const handleSelectAddress = (addressId: number) => {
    if (!addresses) return;

    const selectedAddress = addresses.find((addr) => addr.id === addressId);
    if (!selectedAddress) return;

    setSelectedAddressId(addressId);
    updateFormData({
      fullName: selectedAddress.recipient_name,
      phoneNumber: selectedAddress.recipient_phone,
      address: selectedAddress.street_address,
      province: selectedAddress.province_city,
      district: selectedAddress.district,
      ward: selectedAddress.ward,
    });

    // Hide the form when selecting an existing address
    setShowAddressForm(false);
  };

  // Show new address form
  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setShowAddressForm(true);
    // Clear address fields but keep user's name and phone if available
    updateFormData({
      address: "",
      province: "",
      district: "",
      ward: "",
    });
  };

  // Only show loading state if we're authenticated and still waiting for addresses
  // This prevents the loading indicator from showing when data is already available
  if (isAuthenticated && isLoading && !addresses) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center items-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Đang tải địa chỉ...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Địa chỉ giao hàng</CardTitle>
        {isAuthenticated && (
          <CardDescription>
            Chọn địa chỉ giao hàng hoặc thêm địa chỉ mới
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show message when authenticated user has no addresses */}
        {isAuthenticated && addresses?.length === 0 && !showAddressForm && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.
            </AlertDescription>
          </Alert>
        )}

        {/* Saved Addresses for authenticated users */}
        {isAuthenticated && addresses && addresses.length > 0 && (
          <div className="space-y-4">
            <RadioGroup
              value={selectedAddressId?.toString() || ""}
              onValueChange={(value) => handleSelectAddress(Number(value))}
            >
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start space-x-3 p-3 border rounded-md"
                >
                  <RadioGroupItem
                    value={address.id.toString()}
                    id={`address-${address.id}`}
                    className="mt-1"
                  />
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor={`address-${address.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {address.recipient_name}
                      {address.is_default && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary py-0.5 px-2 rounded">
                          Mặc định
                        </span>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {address.recipient_phone}
                    </p>
                    <p className="text-sm">
                      {address.street_address}, {address.ward},{" "}
                      {address.district}, {address.province_city}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Button
              variant="outline"
              className="mt-2"
              onClick={handleAddNewAddress}
              type="button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm địa chỉ mới
            </Button>
          </div>
        )}

        {/* Address Form - shown for guests or when adding new address */}
        {showAddressForm && (
          <div className="space-y-4 mt-4">
            {isAuthenticated && (
              <div className="bg-muted p-3 rounded-md mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <p className="text-sm">Bạn đang thêm địa chỉ giao hàng mới</p>
              </div>
            )}

            {/* Address fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                  Địa chỉ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="Số nhà, tên đường"
                  value={formData.address || ""}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                />
                {errors.address && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.address}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Province/City */}
              <div className="space-y-2">
                <Label htmlFor="province">
                  Tỉnh/Thành phố <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="province"
                  placeholder="Hà Nội"
                  value={formData.province || ""}
                  onChange={(e) => updateFormData({ province: e.target.value })}
                />
                {errors.province && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.province}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label htmlFor="district">
                  Quận/Huyện <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="district"
                  placeholder="Cầu Giấy"
                  value={formData.district || ""}
                  onChange={(e) => updateFormData({ district: e.target.value })}
                />
                {errors.district && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.district}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Ward */}
              <div className="space-y-2">
                <Label htmlFor="ward">
                  Phường/Xã <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ward"
                  placeholder="Dịch Vọng"
                  value={formData.ward || ""}
                  onChange={(e) => updateFormData({ ward: e.target.value })}
                />
                {errors.ward && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.ward}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            // Nếu có lỗi validate, hiển thị toast cảnh báo
            if (
              errors.address ||
              errors.province ||
              errors.district ||
              errors.ward
            ) {
              toast("Vui lòng nhập đầy đủ thông tin địa chỉ", {
                description: Object.values(errors).filter(Boolean).join("; "),
              });
              return;
            }
            goToNextStep();
          }}
        >
          Tiếp tục
        </Button>
      </CardFooter>
    </Card>
  );
}
