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
import {
  useUserAddresses,
  useAddAddress,
} from "@/features/shop/account/queries";
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipient_name: "",
    recipient_phone: "",
    province_city: "",
    district: "",
    ward: "",
    street_address: "",
    postal_code: "",
    is_default: false,
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const { data: addresses = [], isLoading: addressesLoading } =
    useUserAddresses(userId);
  const addAddressMutation = useAddAddress(userId);

  useEffect(() => {
    if (isAuthenticated && selectedAddressId && addresses.length > 0) {
      const addr = addresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        updateFormData({
          fullName: addr.recipient_name,
          phoneNumber: addr.recipient_phone,
          address: addr.street_address,
          province: addr.province_city,
          district: addr.district,
          ward: addr.ward,
        });
      }
    }
  }, [selectedAddressId, addresses, isAuthenticated]);

  useEffect(() => {
    if (addAddressMutation.isSuccess && addAddressMutation.data) {
      setShowAddForm(false);
      setSelectedAddressId(addAddressMutation.data.id);
      toast("Thêm địa chỉ thành công", {
        description: "Địa chỉ mới đã được thêm và chọn để giao hàng.",
      });
      setNewAddress({
        recipient_name: "",
        recipient_phone: "",
        province_city: "",
        district: "",
        ward: "",
        street_address: "",
        postal_code: "",
        is_default: false,
      });
      setAddErrors({});
    }
  }, [addAddressMutation.isSuccess]);

  function validateNewAddress() {
    const errs: Record<string, string> = {};
    if (!newAddress.recipient_name.trim())
      errs.recipient_name = "Vui lòng nhập họ tên người nhận";
    if (!newAddress.recipient_phone.trim())
      errs.recipient_phone = "Vui lòng nhập số điện thoại";
    else if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(newAddress.recipient_phone))
      errs.recipient_phone = "Số điện thoại không hợp lệ";
    if (!newAddress.province_city.trim())
      errs.province_city = "Vui lòng nhập tỉnh/thành phố";
    if (!newAddress.district.trim()) errs.district = "Vui lòng nhập quận/huyện";
    if (!newAddress.ward.trim()) errs.ward = "Vui lòng nhập phường/xã";
    if (!newAddress.street_address.trim())
      errs.street_address = "Vui lòng nhập địa chỉ chi tiết";
    return errs;
  }

  function handleAddAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateNewAddress();
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    addAddressMutation.mutate({
      recipient_name: newAddress.recipient_name,
      recipient_phone: newAddress.recipient_phone,
      province_city: newAddress.province_city,
      district: newAddress.district,
      ward: newAddress.ward,
      street_address: newAddress.street_address,
      postal_code: newAddress.postal_code || null,
      is_default: newAddress.is_default,
    });
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Địa chỉ giao hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Địa chỉ giao hàng
          </span>
        </CardTitle>
        <CardDescription>
          Chọn địa chỉ giao hàng hoặc thêm địa chỉ mới.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {addressesLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <LoaderCircle className="animate-spin w-4 h-4" /> Đang tải địa
            chỉ...
          </div>
        ) : (
          <>
            {addresses.length > 0 && (
              <RadioGroup
                value={selectedAddressId?.toString() || ""}
                onValueChange={(val) => setSelectedAddressId(Number(val))}
                className="space-y-3"
              >
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`flex items-start space-x-3 border p-3 rounded-md ${
                      selectedAddressId === addr.id ? "border-primary" : ""
                    }`}
                  >
                    <RadioGroupItem
                      value={addr.id.toString()}
                      id={`address-${addr.id}`}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`address-${addr.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {addr.recipient_name} - {addr.recipient_phone}
                        {addr.is_default && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                            Mặc định
                          </span>
                        )}
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {addr.street_address}, {addr.ward}, {addr.district},{" "}
                        {addr.province_city}
                        {addr.postal_code ? `, ${addr.postal_code}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {!showAddForm && (
              <Button
                variant="outline"
                className="mt-4 flex items-center gap-2"
                onClick={() => setShowAddForm(true)}
                type="button"
              >
                <Plus className="w-4 h-4" /> Thêm địa chỉ mới
              </Button>
            )}

            {showAddForm && (
              <form
                className="mt-4 space-y-3"
                onSubmit={handleAddAddressSubmit}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Họ tên người nhận</Label>
                    <Input
                      value={newAddress.recipient_name}
                      onChange={(e) =>
                        setNewAddress((a) => ({
                          ...a,
                          recipient_name: e.target.value,
                        }))
                      }
                    />
                    {addErrors.recipient_name && (
                      <div className="text-xs text-destructive">
                        {addErrors.recipient_name}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Số điện thoại</Label>
                    <Input
                      value={newAddress.recipient_phone}
                      onChange={(e) =>
                        setNewAddress((a) => ({
                          ...a,
                          recipient_phone: e.target.value,
                        }))
                      }
                    />
                    {addErrors.recipient_phone && (
                      <div className="text-xs text-destructive">
                        {addErrors.recipient_phone}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Tỉnh/Thành phố</Label>
                    <Input
                      value={newAddress.province_city}
                      onChange={(e) =>
                        setNewAddress((a) => ({
                          ...a,
                          province_city: e.target.value,
                        }))
                      }
                    />
                    {addErrors.province_city && (
                      <div className="text-xs text-destructive">
                        {addErrors.province_city}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Quận/Huyện</Label>
                    <Input
                      value={newAddress.district}
                      onChange={(e) =>
                        setNewAddress((a) => ({
                          ...a,
                          district: e.target.value,
                        }))
                      }
                    />
                    {addErrors.district && (
                      <div className="text-xs text-destructive">
                        {addErrors.district}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Phường/Xã</Label>
                    <Input
                      value={newAddress.ward}
                      onChange={(e) =>
                        setNewAddress((a) => ({ ...a, ward: e.target.value }))
                      }
                    />
                    {addErrors.ward && (
                      <div className="text-xs text-destructive">
                        {addErrors.ward}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Địa chỉ chi tiết</Label>
                    <Input
                      value={newAddress.street_address}
                      onChange={(e) =>
                        setNewAddress((a) => ({
                          ...a,
                          street_address: e.target.value,
                        }))
                      }
                    />
                    {addErrors.street_address && (
                      <div className="text-xs text-destructive">
                        {addErrors.street_address}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Mã bưu điện (không bắt buộc)</Label>
                    <Input
                      value={newAddress.postal_code}
                      onChange={(e) =>
                        setNewAddress((a) => ({
                          ...a,
                          postal_code: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={newAddress.is_default}
                      onChange={(e) =>
                        setNewAddress((a) => ({
                          ...a,
                          is_default: e.target.checked,
                        }))
                      }
                    />
                    <Label htmlFor="is_default" className="cursor-pointer">
                      Đặt làm địa chỉ mặc định
                    </Label>
                  </div>
                </div>
                {addAddressMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {addAddressMutation.error instanceof Error
                        ? addAddressMutation.error.message
                        : "Đã xảy ra lỗi khi thêm địa chỉ."}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2 mt-2">
                  <Button type="submit" disabled={addAddressMutation.isLoading}>
                    {addAddressMutation.isLoading ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle className="animate-spin w-4 h-4" /> Đang
                        lưu...
                      </span>
                    ) : (
                      "Lưu địa chỉ"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddErrors({});
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={goToNextStep} disabled={!selectedAddressId}>
          Tiếp tục
        </Button>
      </CardFooter>
    </Card>
  );
}
