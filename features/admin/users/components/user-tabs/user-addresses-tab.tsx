"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type UserAddress } from "../../types";

interface UserAddressesTabProps {
  addresses: UserAddress[];
  isLoading?: boolean;
}

function UserAddressesTabComponent({
  addresses,
  isLoading = false,
}: UserAddressesTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Người dùng này chưa có địa chỉ nào.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <Card key={address.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">
                    {address.recipient_name} ({address.recipient_phone})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {address.street_address}, {address.ward}, {address.district}
                    , {address.province_city}
                    {address.postal_code && `, ${address.postal_code}`}
                  </p>
                </div>
              </div>
              {address.is_default && (
                <Badge variant="outline" className="ml-auto">
                  Mặc định
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default memo(UserAddressesTabComponent);
