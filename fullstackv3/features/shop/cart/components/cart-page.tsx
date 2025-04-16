"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  ShoppingBag,
  Loader2,
  Receipt,
  ShoppingCart as ShoppingCartIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateDiscountCode } from "../cart-actions";
import { EmptyCart } from "./empty-cart";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import {
  useCartQuery,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "../hooks";
import { useAuthQuery } from "@/features/auth/hooks";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

function SmartSummaryBar({
  selectedCartItems,
  discountInfo,
  discountCode,
  onRemoveDiscount,
  onApplyDiscount,
  discountError,
  isApplyingDiscount,
  shippingFee,
  freeShippingThreshold,
  settings,
  isAuthenticated,
  handleCheckout,
}: any) {
  const subtotal = selectedCartItems.reduce(
    (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const saleDiscount = selectedCartItems.reduce((sum: number, item: any) => {
    const price = item.product?.price || 0;
    const sale = item.product?.sale_price;
    if (sale && sale < price) {
      return sum + (price - sale) * item.quantity;
    }
    return sum;
  }, 0);
  const voucherDiscount = (() => {
    if (!discountInfo || !discountInfo.discount) return 0;
    const d = discountInfo.discount;
    if (d.discount_type === "fixed" && d.discount_amount) {
      return Math.min(d.discount_amount, subtotal - saleDiscount);
    } else if (d.discount_percentage) {
      let amount = ((subtotal - saleDiscount) * d.discount_percentage) / 100;
      if (d.max_discount_amount && amount > d.max_discount_amount) {
        amount = d.max_discount_amount;
      }
      return amount;
    }
    return 0;
  })();
  const isFreeShipping =
    freeShippingThreshold !== null &&
    subtotal - saleDiscount - voucherDiscount >= freeShippingThreshold;
  const finalShippingFee = isFreeShipping ? 0 : shippingFee;
  const cartTotal = subtotal - saleDiscount - voucherDiscount;

  if (!selectedCartItems || selectedCartItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-background/95 border-t border-border shadow-lg px-2 py-3 sm:px-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="font-semibold text-base">
            Đã chọn: {selectedCartItems.length} sản phẩm
          </span>
          <span className="text-muted-foreground text-sm">
            Tạm tính: <b>{formatCurrency(subtotal)}</b>
          </span>
          {saleDiscount > 0 && (
            <span className="text-green-600 text-sm">
              Khuyến mãi: -{formatCurrency(saleDiscount)}
            </span>
          )}
          {voucherDiscount > 0 && (
            <span className="text-green-600 text-sm">
              Mã giảm giá: -{formatCurrency(voucherDiscount)}
            </span>
          )}
          <span className="text-muted-foreground text-sm">
            Phí ship:{" "}
            {finalShippingFee > 0 ? (
              formatCurrency(finalShippingFee)
            ) : (
              <span className="text-green-600">Miễn phí</span>
            )}
          </span>
        </div>
        <div className="font-semibold text-lg">
          Tổng:{" "}
          <span className="text-primary">
            {formatCurrency(cartTotal + finalShippingFee)}
          </span>
        </div>
      </div>
      <Button
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => handleCheckout(selectedCartItems)}
        disabled={selectedCartItems.length === 0}
      >
        Thanh toán{" "}
        {selectedCartItems.length > 0 ? `(${selectedCartItems.length})` : ""}
      </Button>
    </div>
  );
}

export function CartPage() {
  const { data: cartItems = [], isLoading } = useCartQuery();
  const { mutate: updateCartItem, isLoading: isUpdating } = useUpdateCartItem();
  const { mutate: removeCartItem, isLoading: isRemoving } = useRemoveCartItem();
  const { mutate: clearCart } = useClearCart();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const { success, error } = useSonnerToast();
  const { settings } = useShopSettings();
  const shippingFee = settings?.shipping_fee || 0;
  const freeShippingThreshold = settings?.free_shipping_threshold || null;

  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{
    discount: any;
    discountAmount: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const [openClearDialog, setOpenClearDialog] = useState(false);

  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
  const isItemSelected = (item: any) =>
    selectedItems.includes(isAuthenticated ? String(item.id) : item.variant_id);
  const handleSelectItem = (item: any, checked: boolean) => {
    const key = isAuthenticated ? String(item.id) : item.variant_id;
    setSelectedItems((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(
        cartItems.map((item) =>
          isAuthenticated ? String(item.id) : item.variant_id
        )
      );
    } else {
      setSelectedItems([]);
    }
  };
  const handleRemoveSelected = () => {
    selectedItems.forEach((key) => removeCartItem(key));
    setSelectedItems([]);
    success("Đã xóa các sản phẩm đã chọn khỏi giỏ hàng");
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const saleDiscount = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const sale = item.product?.sale_price;
        if (sale && sale < price) {
          return sum + (price - sale) * item.quantity;
        }
        return sum;
      }, 0),
    [cartItems]
  );

  const productCount = cartItems.length;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const voucherDiscount = useMemo(() => {
    if (!discountInfo || !discountInfo.discount) return 0;
    const d = discountInfo.discount;
    if (d.discount_type === "fixed" && d.discount_amount) {
      return Math.min(d.discount_amount, subtotal - saleDiscount);
    } else if (d.discount_percentage) {
      let amount = ((subtotal - saleDiscount) * d.discount_percentage) / 100;
      if (d.max_discount_amount && amount > d.max_discount_amount) {
        amount = d.max_discount_amount;
      }
      return amount;
    }
    return 0;
  }, [discountInfo, subtotal, saleDiscount]);

  const isFreeShipping =
    freeShippingThreshold !== null &&
    subtotal - saleDiscount - voucherDiscount >= freeShippingThreshold;
  const finalShippingFee = isFreeShipping ? 0 : shippingFee;

  const cartTotal = subtotal - saleDiscount - voucherDiscount;

  const handleApplyDiscount = async () => {
    setIsApplyingDiscount(true);
    setDiscountError(null);
    try {
      const result = await validateDiscountCode(discountCode, subtotal);
      if (result.success && result.data) {
        setDiscountInfo(result.data);
        setDiscountError(null);
        success(`Đã áp dụng mã giảm giá ${discountCode}`);
      } else {
        setDiscountInfo(null);
        setDiscountError(result.error || "Mã giảm giá không hợp lệ");
      }
    } catch (err) {
      setDiscountInfo(null);
      setDiscountError("Đã xảy ra lỗi khi áp dụng mã giảm giá");
      error("Đã xảy ra lỗi khi áp dụng mã giảm giá");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountInfo(null);
    setDiscountCode("");
    setDiscountError(null);
  };

  const handleClearCart = () => {
    clearCart(undefined, {
      onSuccess: () => {
        setOpenClearDialog(false);
        success("Đã xóa toàn bộ giỏ hàng");
      },
      onError: () => {
        setOpenClearDialog(false);
        error("Không thể xóa giỏ hàng. Vui lòng thử lại.");
      },
    });
  };

  const renderDiscountInfo = () => {
    if (!discountInfo) return null;
    const d = discountInfo.discount;
    return (
      <div className="mt-2 text-sm text-green-600">
        <div>
          Đã áp dụng: <b>{discountCode}</b>
        </div>
        {d.discount_type === "fixed" ? (
          <div>
            Giảm: <b>{formatCurrency(d.discount_amount)}</b>
            {d.max_discount_amount
              ? ` (tối đa ${formatCurrency(d.max_discount_amount)})`
              : ""}
          </div>
        ) : d.discount_percentage ? (
          <div>
            Giảm: <b>{d.discount_percentage}%</b>
            {d.max_discount_amount
              ? ` (tối đa ${formatCurrency(d.max_discount_amount)})`
              : ""}
          </div>
        ) : null}
        {d.min_order_value && (
          <div>Đơn tối thiểu: {formatCurrency(d.min_order_value)}</div>
        )}
        {d.remaining_uses !== undefined && d.max_uses && (
          <div>
            Lượt dùng còn lại: {d.remaining_uses}/{d.max_uses}
          </div>
        )}
        {voucherDiscount > 0 && (
          <div>
            Đã giảm: <b>-{formatCurrency(voucherDiscount)}</b>
          </div>
        )}
      </div>
    );
  };

  const smartBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedItems.length > 0 && smartBarRef.current) {
      smartBarRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [selectedItems.length]);

  const selectedCartItems =
    selectedItems.length > 0
      ? cartItems.filter((item) =>
          selectedItems.includes(
            isAuthenticated ? String(item.id) : item.variant_id
          )
        )
      : [];

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container py-8 px-2 sm:px-4">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-2">
          <ShoppingCartIcon className="h-7 w-7" />
        </span>
        <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
        <span className="ml-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-base font-semibold">
          {productCount} sản phẩm
        </span>
        <span className="ml-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-base font-semibold">
          {totalQuantity} số lượng
        </span>
        <div className="flex-1" />
        <AlertDialog open={openClearDialog} onOpenChange={setOpenClearDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary"
              onClick={() => setOpenClearDialog(true)}
            >
              Xóa toàn bộ giỏ hàng
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Xác nhận xóa toàn bộ giỏ hàng?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ xóa tất cả sản phẩm khỏi giỏ hàng của bạn. Bạn
                không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearCart}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">
                <Checkbox
                  checked={
                    selectedItems.length === cartItems.length &&
                    cartItems.length > 0
                  }
                  indeterminate={
                    selectedItems.length > 0 &&
                    selectedItems.length < cartItems.length
                      ? "true"
                      : undefined
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Chọn tất cả"
                />
              </TableHead>
              <TableHead className="min-w-[180px]">Sản phẩm</TableHead>
              <TableHead className="w-28 text-center">Đơn giá</TableHead>
              <TableHead className="w-32 text-center">Số lượng</TableHead>
              <TableHead className="w-32 text-center">Thành tiền</TableHead>
              <TableHead className="w-16 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cartItems.map((item) => {
              const key = isAuthenticated ? String(item.id) : item.variant_id;
              const price =
                item.product?.sale_price &&
                item.product.sale_price < item.product.price
                  ? item.product.sale_price
                  : item.product.price || 0;
              return (
                <TableRow key={key} className="align-middle">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isItemSelected(item)}
                      onCheckedChange={(checked) =>
                        handleSelectItem(item, !!checked)
                      }
                      aria-label="Chọn sản phẩm"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded bg-secondary/20 border overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            item.product?.images?.find((img) => img.is_main)
                              ?.image_url ||
                            item.product?.images?.[0]?.image_url ||
                            "/placeholder.jpg"
                          }
                          alt={item.product?.name || "Product image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium line-clamp-1 text-sm">
                          <span className="text-muted-foreground">Tên:</span>{" "}
                          {item.product?.name}
                        </div>
                        {item.product?.brand?.name && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Thương hiệu:</span>{" "}
                            {item.product.brand.name}
                          </div>
                        )}
                        {item.product?.volume_ml && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Dung tích:</span>{" "}
                            {item.product.volume_ml}ml
                          </div>
                        )}
                        {item.product?.slug && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Mã SP:</span>{" "}
                            {item.product.slug}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-primary">
                        {formatCurrency(price)}
                      </span>
                      {item.product?.sale_price &&
                        item.product.sale_price < item.product.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(item.product.price)}
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() =>
                          updateCartItem({
                            itemIdOrVariantId: isAuthenticated
                              ? String(item.id)
                              : item.variant_id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        disabled={item.quantity <= 1 || isUpdating}
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-8 text-center font-medium text-sm py-1">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          item.quantity
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() =>
                          updateCartItem({
                            itemIdOrVariantId: isAuthenticated
                              ? String(item.id)
                              : item.variant_id,
                            quantity: item.quantity + 1,
                          })
                        }
                        disabled={isUpdating}
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {formatCurrency(price * item.quantity)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() =>
                        removeCartItem(
                          isAuthenticated ? String(item.id) : item.variant_id
                        )
                      }
                      disabled={isRemoving}
                      aria-label="Xóa sản phẩm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {selectedItems.length > 0 && (
          <div className="flex justify-end mt-2">
            <Button
              variant="destructive"
              onClick={handleRemoveSelected}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary"
            >
              Xóa các sản phẩm đã chọn
            </Button>
          </div>
        )}
      </div>
      <div className="mt-4">
        <Button variant="outline" asChild>
          <Link href="/san-pham">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
        </Button>
      </div>
      <div ref={smartBarRef} />
      <SmartSummaryBar
        selectedCartItems={selectedCartItems}
        discountInfo={discountInfo}
        discountCode={discountCode}
        onRemoveDiscount={handleRemoveDiscount}
        onApplyDiscount={handleApplyDiscount}
        discountError={discountError}
        isApplyingDiscount={isApplyingDiscount}
        shippingFee={shippingFee}
        freeShippingThreshold={freeShippingThreshold}
        settings={settings}
        isAuthenticated={isAuthenticated}
        handleCheckout={(items: any[]) => {
          success("Chức năng thanh toán nhiều sản phẩm đã chọn sẽ sớm có!");
        }}
      />
      {selectedItems.length === 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Nhập mã giảm giá"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      disabled={isApplyingDiscount}
                    />
                  </div>
                  {discountInfo ? (
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary"
                      onClick={handleRemoveDiscount}
                    >
                      Xóa
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount}
                    >
                      {isApplyingDiscount ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Receipt className="h-4 w-4 mr-2" />
                      )}
                      Áp dụng
                    </Button>
                  )}
                </div>
                {discountError && (
                  <div className="mt-2">
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{discountError}</AlertDescription>
                    </Alert>
                  </div>
                )}
                {renderDiscountInfo()}
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {saleDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Khuyến mãi sản phẩm</span>
                    <span>-{formatCurrency(saleDiscount)}</span>
                  </div>
                )}
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      {discountInfo?.discount.discount_type === "fixed"
                        ? "Mã giảm giá"
                        : discountInfo?.discount.discount_percentage
                        ? `Giảm giá (${discountInfo.discount.discount_percentage}%)`
                        : "Mã giảm giá"}
                    </span>
                    <span>-{formatCurrency(voucherDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  {finalShippingFee > 0 ? (
                    <span>{formatCurrency(finalShippingFee)}</span>
                  ) : (
                    <span className="text-green-600">Miễn phí</span>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-semibold pt-1">
                  <span>Tổng cộng</span>
                  <span className="text-lg">
                    {formatCurrency(cartTotal + finalShippingFee)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full">
                <Link href="/thanh-toan">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Tiến hành thanh toán
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
