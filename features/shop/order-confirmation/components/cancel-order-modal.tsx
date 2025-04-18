"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cancelOrderByToken, cancelOrderByUser } from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CancelOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: number;
  token?: string;
  onCancelled: () => void;
}

export function CancelOrderModal({
  open,
  onOpenChange,
  orderId,
  token,
  onCancelled,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useSonnerToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reason.trim().length < 10) {
      setError("Vui lòng nhập lý do hủy đơn hàng (tối thiểu 10 ký tự)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let response;

      // Xử lý hủy đơn hàng dựa trên loại đơn (token đối với khách vãng lai, orderId đối với người dùng đã đăng nhập)
      if (token) {
        response = await cancelOrderByToken(token, reason);
      } else if (orderId) {
        response = await cancelOrderByUser(orderId, reason);
      } else {
        throw new Error("Thiếu thông tin đơn hàng");
      }

      if (!response.success) {
        setError(
          "error" in response
            ? response.error
            : "Có lỗi xảy ra khi hủy đơn hàng"
        );
        return;
      }

      toast("Hủy đơn hàng thành công", {
        description: "Đơn hàng của bạn đã được hủy",
      });

      onOpenChange(false);
      onCancelled();
    } catch (error) {
      setError("Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại sau.");
      console.error("Error cancelling order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Hủy đơn hàng</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp lý do hủy đơn hàng của bạn. Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Lý do hủy <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Vui lòng nhập lý do hủy đơn hàng của bạn..."
                rows={4}
                required
                minLength={10}
                maxLength={500}
                className="resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                {reason.length}/500 ký tự
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý
                </>
              ) : (
                "Xác nhận hủy đơn"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
