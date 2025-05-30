"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "../use-cart";
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
import { useSelectedCartItems } from "../hooks";
import { useQueryClient } from "@tanstack/react-query";

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
  handleRemoveSelected,
  setDiscountCode,
}: any) {
  const subtotal = selectedCartItems.reduce(
    (sum: number, item: any) =>
      sum + (item.product?.price || 0) * item.quantity,
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

  let voucherDiscount = 0;
  if (discountInfo && discountInfo.discount) {
    const d = discountInfo.discount;
    const afterSale = Math.max(0, subtotal - saleDiscount);

    // Check minimum order value first
    if (d.min_order_value && afterSale < d.min_order_value) {
      // Don't apply discount if minimum order value is not met
      voucherDiscount = 0;
    } else if (!d.discount_percentage) {
      // Fixed amount discount (when discount_percentage is falsy)
      voucherDiscount = d.max_discount_amount
        ? Math.min(d.max_discount_amount, afterSale)
        : 0;
    } else {
      // Percentage-based discount
      let amount = (afterSale * d.discount_percentage) / 100;
      if (d.max_discount_amount) {
        amount = Math.min(amount, d.max_discount_amount);
      }
      voucherDiscount = Math.min(amount, afterSale); // Don't exceed total after sale
    }
  }

  const isFreeShipping =
    freeShippingThreshold !== null &&
    subtotal - saleDiscount - voucherDiscount >= freeShippingThreshold;
  const finalShippingFee = isFreeShipping ? 0 : shippingFee;
  const cartTotal =
    Math.max(0, subtotal - saleDiscount - voucherDiscount) + finalShippingFee;

  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

  if (!selectedCartItems || selectedCartItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-background/95 border-t border-border shadow-lg px-2 py-2 sm:py-3 sm:px-4 md:px-6 flex flex-col gap-1 sm:gap-2 animate-in fade-in slide-in-from-bottom-4">
      {/* Phần trên: Chọn sản phẩm, mã giảm giá và nút thanh toán */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 w-full items-center">
        {/* Đã chọn sản phẩm - hiển thị ở mọi kích thước màn hình */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm sm:text-base">
            Đã chọn: {selectedCartItems.length} sản phẩm
          </span>
        </div>

        {/* Mã giảm giá - thu gọn trên mobile, mở rộng trên md+ */}
        <div className="flex items-center gap-1 sm:gap-2 w-full xs:justify-start md:justify-center">
          <Input
            placeholder="Mã giảm giá"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            disabled={!!discountInfo || isApplyingDiscount}
            className="max-w-[110px] sm:max-w-[160px] h-8 sm:h-9 text-xs sm:text-sm"
          />
          {discountInfo ? (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
              onClick={onRemoveDiscount}
            >
              Xóa mã
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={onApplyDiscount}
              disabled={isApplyingDiscount || !discountCode}
              className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
            >
              {isApplyingDiscount ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
              ) : (
                <Receipt className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              Áp dụng
            </Button>
          )}
        </div>

        {/* Nút xóa và thanh toán - căn phải ở mọi kích thước màn hình */}
        <div className="flex items-center gap-1 sm:gap-2 justify-between xs:justify-end col-span-1 xs:col-span-2 md:col-span-1 mt-1 xs:mt-0">
          <AlertDialog
            open={openRemoveDialog}
            onOpenChange={setOpenRemoveDialog}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 hover:border-primary h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                onClick={() => setOpenRemoveDialog(true)}
                disabled={selectedCartItems.length === 0}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="sm:hidden">Xóa</span>
                <span className="hidden sm:inline">Xóa đã chọn</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Xác nhận xóa các sản phẩm đã chọn?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này sẽ xóa các sản phẩm đã chọn khỏi giỏ hàng. Bạn
                  không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    handleRemoveSelected();
                    setOpenRemoveDialog(false);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-4"
            onClick={() => handleCheckout(selectedCartItems)}
            disabled={selectedCartItems.length === 0}
          >
            <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Thanh toán{" "}
            {selectedCartItems.length > 0
              ? `(${selectedCartItems.length})`
              : ""}
          </Button>
        </div>
      </div>

      {/* Phần giữa: Thông tin giá tiền */}
      <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-1 sm:gap-2 w-full text-xs sm:text-sm mt-1">
        <div className="flex flex-col gap-0 sm:gap-1">
          <span className="text-muted-foreground">Tạm tính</span>
          <span className="font-semibold">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex flex-col gap-0 sm:gap-1">
          <span className="text-muted-foreground">Giảm giá SP</span>
          <span className="text-green-600 font-semibold">
            -{saleDiscount > 0 ? formatCurrency(saleDiscount) : 0}
          </span>
        </div>
        <div className="flex flex-col gap-0 sm:gap-1">
          <span className="text-muted-foreground">Mã giảm giá</span>
          {voucherDiscount > 0 ? (
            <span className="text-green-600 font-semibold">
              -{formatCurrency(voucherDiscount)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
        <div className="flex flex-col gap-0 sm:gap-1">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          {finalShippingFee > 0 ? (
            <span className="font-semibold">
              {formatCurrency(finalShippingFee)}
            </span>
          ) : (
            <span className="text-green-600 font-semibold">Miễn phí</span>
          )}
        </div>
        <div className="flex flex-col gap-0 sm:gap-1 xs:col-span-3 md:col-span-1 mt-1 xs:mt-2 md:mt-0 border-t xs:border-t-0 pt-1 xs:pt-0">
          <span className="text-muted-foreground">Tổng cộng</span>
          <span className="font-bold text-primary text-base sm:text-lg">
            {formatCurrency(cartTotal)}
          </span>
        </div>
      </div>

      {/* Phần dưới: Thông báo lỗi và chi tiết giảm giá */}
      <div className="flex flex-col xs:flex-row xs:items-center gap-1 sm:gap-2 w-full mt-1">
        {discountError && (
          <Alert
            variant="destructive"
            className="py-1 sm:py-2 flex items-center gap-1 sm:gap-2 !p-2"
          >
            <span className="flex items-center">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mr-1" />
            </span>
            <span className="text-xs sm:text-sm leading-4 sm:leading-5">
              {discountError}
            </span>
          </Alert>
        )}

        {discountInfo && (
          <div className="text-xs sm:text-sm text-green-600 flex flex-wrap gap-1 sm:gap-2 items-center">
            <span>
              Đã áp dụng: <b>{discountCode}</b>
            </span>
            {discountInfo.discount.discount_type === "fixed" && (
              <span>
                Giảm:{" "}
                <b>{formatCurrency(discountInfo.discount.discount_amount)}</b>
              </span>
            )}
            {discountInfo.discount.discount_percentage && (
              <span>
                Giảm: <b>{discountInfo.discount.discount_percentage}%</b>
              </span>
            )}
            {discountInfo.discount.max_discount_amount && (
              <span>
                Tối đa:{" "}
                {formatCurrency(discountInfo.discount.max_discount_amount)}
              </span>
            )}
            {discountInfo.discount.min_order_value && (
              <span className="hidden sm:inline">
                Đơn tối thiểu:{" "}
                {formatCurrency(discountInfo.discount.min_order_value)}
              </span>
            )}
            {voucherDiscount > 0 && (
              <span>
                Đã giảm: <b>-{formatCurrency(voucherDiscount)}</b>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function CartPage() {
  const router = useRouter();
  const { data: cartItems = [], isLoading, isFetching } = useCartQuery();
  const { mutate: updateCartItem } = useUpdateCartItem();
  const { mutate: removeCartItem } = useRemoveCartItem();
  const { mutate: clearCart } = useClearCart();
  const { data: session, isLoading: isSessionLoading } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const { success, error } = useSonnerToast();
  const { settings } = useShopSettings();
  const shippingFee = settings?.shipping_fee || 0;
  const freeShippingThreshold = settings?.free_shipping_threshold || null;
  const queryClient = useQueryClient();

  // Sử dụng hook mới để quản lý các sản phẩm đã chọn
  const {
    selectedItems: selectedCartItems,
    isItemSelected,
    toggleItemSelection,
    toggleSelectAll,
    clearSelectedItems,
  } = useSelectedCartItems();

  // Theo dõi trạng thái loading cho từng sản phẩm
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {}
  );
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>(
    {}
  );

  // Helper functions để kiểm tra trạng thái loading của từng sản phẩm
  const isItemUpdating = (key: string | number) => !!updatingItems[String(key)];
  const isItemRemoving = (key: string | number) => !!removingItems[String(key)];

  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{
    discount: any;
    discountAmount: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const [openClearDialog, setOpenClearDialog] = useState(false);

  // Handle checkbox events
  const handleSelectItem = (item: any, checked: boolean) => {
    toggleItemSelection(item, checked);
  };

  const handleSelectAll = (checked: boolean) => {
    toggleSelectAll(checked);
  };

  const handleRemoveSelected = () => {
    // Get IDs of selected items
    selectedCartItems.forEach((item) => {
      const key = isAuthenticated ? String(item.id) : item.variant_id;
      // Set loading state
      setRemovingItems((prev) => ({ ...prev, [key]: true }));
      // Remove item
      removeCartItem(key, {
        onSettled: () => {
          // Clear loading state
          setRemovingItems((prev) => ({ ...prev, [key]: false }));
        },
      });
    });
    // Clear selected items
    clearSelectedItems();
    success("Đã xóa các sản phẩm đã chọn khỏi giỏ hàng");
  };

  // Reset selected items when cart items change
  useEffect(() => {
    clearSelectedItems();
  }, [isAuthenticated]);

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
    const afterSale = Math.max(0, subtotal - saleDiscount);
    if (d.min_order_value && afterSale < d.min_order_value) {
      return 0;
    } else if (!d.discount_percentage) {
      return d.max_discount_amount
        ? Math.min(d.max_discount_amount, afterSale)
        : 0;
    } else {
      let amount = (afterSale * d.discount_percentage) / 100;
      if (d.max_discount_amount) {
        amount = Math.min(amount, d.max_discount_amount);
      }
      return Math.min(amount, afterSale);
    }
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

  const handleCheckout = (items: any[]) => {
    // Lưu các sản phẩm được chọn vào TanStack Query cache
    queryClient.setQueryData(["selectedCheckoutItems"], items);

    // Tiếp tục chuyển hướng với mã giảm giá nếu có
    const query = discountCode
      ? `?code=${encodeURIComponent(discountCode)}`
      : "";
    router.push(`/thanh-toan${query}`);
  };

  const smartBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedCartItems.length > 0 && smartBarRef.current) {
      smartBarRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [selectedCartItems.length]);

  // Show loading state when session is loading or cart is loading/fetching
  const isLoadingData = isSessionLoading || isLoading || isFetching;

  // Only show loading if there are no items or still loading data
  if (isLoadingData) {
    return (
      <div className="container py-8 px-2 sm:px-4">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-2">
            <ShoppingCartIcon className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
          <div className="flex-1" />
        </div>
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm p-4">
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Đang tải giỏ hàng...</span>
          </div>
        </div>
      </div>
    );
  }

  // Only show empty cart when we're sure there are no items (after loading)
  if (!isLoadingData && cartItems.length === 0) {
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
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">
                <Checkbox
                  checked={
                    selectedCartItems.length === cartItems.length &&
                    cartItems.length > 0
                  }
                  indeterminate={
                    selectedCartItems.length > 0 &&
                    selectedCartItems.length < cartItems.length
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
                        onClick={() => {
                          setUpdatingItems((prev) => ({
                            ...prev,
                            [key]: true,
                          }));
                          updateCartItem(
                            {
                              itemIdOrVariantId: isAuthenticated
                                ? String(item.id)
                                : item.variant_id,
                              quantity: Math.max(1, item.quantity - 1),
                            },
                            {
                              onSettled: () => {
                                setUpdatingItems((prev) => ({
                                  ...prev,
                                  [key]: false,
                                }));
                              },
                            }
                          );
                        }}
                        disabled={item.quantity <= 1 || isItemUpdating(key)}
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-8 text-center font-medium text-sm py-1">
                        {isItemUpdating(key) ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          item.quantity
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() => {
                          setUpdatingItems((prev) => ({
                            ...prev,
                            [key]: true,
                          }));
                          updateCartItem(
                            {
                              itemIdOrVariantId: isAuthenticated
                                ? String(item.id)
                                : item.variant_id,
                              quantity: item.quantity + 1,
                            },
                            {
                              onSettled: () => {
                                setUpdatingItems((prev) => ({
                                  ...prev,
                                  [key]: false,
                                }));
                              },
                            }
                          );
                        }}
                        disabled={isItemUpdating(key)}
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
                    <button
                      type="button"
                      className="text-destructive hover:bg-destructive/10 rounded p-1"
                      onClick={() => {
                        setRemovingItems((prev) => ({
                          ...prev,
                          [key]: true,
                        }));
                        removeCartItem(key, {
                          onSettled: () => {
                            setRemovingItems((prev) => ({
                              ...prev,
                              [key]: false,
                            }));
                          },
                        });
                        success("Đã xóa sản phẩm khỏi giỏ hàng");
                      }}
                      disabled={isItemRemoving(key)}
                      title="Xóa sản phẩm"
                    >
                      {isItemRemoving(key) ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
        handleCheckout={handleCheckout}
        handleRemoveSelected={handleRemoveSelected}
        setDiscountCode={setDiscountCode}
      />
    </div>
  );
}
