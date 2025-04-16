"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, ClipboardCopy } from "lucide-react";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

interface CopyAccessTokenProps {
  accessToken: string;
}

export function CopyAccessToken({ accessToken }: CopyAccessTokenProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useSonnerToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accessToken);
      setCopied(true);
      toast("Đã sao chép", {
        description: "Mã tra cứu đơn hàng đã được sao chép vào clipboard.",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast("Không thể sao chép", {
        description: "Vui lòng sao chép thủ công.",
      });
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Mã tra cứu đơn hàng
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={accessToken}
                readOnly
                className="pr-10 font-mono text-sm"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
                type="button"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Sao chép mã tra cứu</span>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0"
            >
              <ClipboardCopy className="mr-2 h-4 w-4" />
              {copied ? "Đã sao chép" : "Sao chép"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Lưu lại mã này để tra cứu đơn hàng sau này.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
