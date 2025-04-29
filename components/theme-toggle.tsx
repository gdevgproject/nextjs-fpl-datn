"use client";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import type React from "react";

import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<"top" | "bottom" | "left" | "right">(
    "bottom"
  );

  // Đảm bảo component được mount để tránh sai lệch hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Xác định vị trí tốt nhất cho popover dựa trên vị trí của nút
  useEffect(() => {
    if (isExpanded && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Xác định vị trí tốt nhất dựa trên không gian có sẵn
      if (rect.top > 250) {
        setPosition("top");
      } else if (rect.bottom + 250 < viewportHeight) {
        setPosition("bottom");
      } else if (rect.left > 250) {
        setPosition("left");
      } else {
        setPosition("right");
      }
    }
  }, [isExpanded]);

  // Đóng toggle khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // Đóng toggle khi nhấn Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isExpanded]);

  if (!mounted) return null;

  // Lấy biểu tượng của giao diện hiện tại
  const getCurrentIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-3 w-3 text-amber-200" />;
      case "system":
        return <Monitor className="h-3 w-3 text-sky-200" />;
      case "dark":
        return <Moon className="h-3 w-3 text-indigo-200" />;
      default:
        return <Sun className="h-3 w-3 text-amber-200" />;
    }
  };

  // Xác định màu gradient dựa trên theme
  const getGradient = () => {
    switch (theme) {
      case "light":
        return "bg-gradient-to-br from-amber-400 to-orange-500";
      case "system":
        return "bg-gradient-to-br from-sky-400 to-blue-500";
      case "dark":
        return "bg-gradient-to-br from-indigo-400 to-purple-500";
      default:
        return "bg-gradient-to-br from-amber-400 to-orange-500";
    }
  };

  // Xác định vị trí và animation cho popover
  const getPopoverStyles = () => {
    switch (position) {
      case "top":
        return {
          container: "bottom-full mb-2 left-1/2 -translate-x-1/2",
          arrow:
            "top-full left-1/2 -translate-x-1/2 border-t border-l rotate-225",
          animation: "slide-in-from-top-2",
        };
      case "bottom":
        return {
          container: "top-full mt-2 left-1/2 -translate-x-1/2",
          arrow:
            "-top-1.5 left-1/2 -translate-x-1/2 border-t border-l rotate-45",
          animation: "slide-in-from-bottom-2",
        };
      case "left":
        return {
          container: "right-full mr-2 top-1/2 -translate-y-1/2",
          arrow:
            "left-full top-1/2 -translate-y-1/2 border-t border-l -rotate-45",
          animation: "slide-in-from-left-2",
        };
      case "right":
        return {
          container: "left-full ml-2 top-1/2 -translate-y-1/2",
          arrow:
            "-left-1.5 top-1/2 -translate-y-1/2 border-t border-l rotate-[135deg]",
          animation: "slide-in-from-right-2",
        };
    }
  };

  const popoverStyles = getPopoverStyles();

  return (
    <div className="relative inline-block">
      {/* Nút chọn giao diện */}
      <button
        ref={buttonRef}
        className={cn(
          "relative h-6 w-6 rounded-full shadow-lg flex items-center justify-center cursor-pointer",
          "transition-all duration-500 ease-out",
          "hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background focus:ring-primary",
          getGradient()
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Tùy chọn giao diện"
        aria-expanded={isExpanded}
        aria-haspopup="true"
      >
        <span className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm" />
        {getCurrentIcon()}
      </button>

      {/* Popover chọn giao diện */}
      {isExpanded && (
        <>
          {/* Lớp nền mờ trên thiết bị di động */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsExpanded(false)}
          />

          {/* Popover */}
          <div
            ref={popoverRef}
            className={cn(
              "absolute z-50",
              "animate-in duration-200",
              popoverStyles.animation,
              popoverStyles.container
            )}
          >
            <div className="w-[240px] sm:w-[280px] md:w-[240px] overflow-hidden rounded-lg bg-popover/80 backdrop-blur-md border shadow-xl">
              {/* Header */}
              <div className="px-3 py-2 border-b">
                <h3 className="text-xs font-medium text-foreground">
                  Chọn giao diện
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tùy chỉnh giao diện theo sở thích của bạn
                </p>
              </div>

              {/* Theme options */}
              <div className="p-2 grid grid-cols-3 gap-1.5">
                {/* Light theme */}
                <ThemeOption
                  icon={<Sun className="h-3.5 w-3.5" />}
                  label="Sáng"
                  description="Giao diện sáng"
                  isActive={theme === "light"}
                  onClick={() => {
                    setTheme("light");
                    setTimeout(() => setIsExpanded(false), 300);
                  }}
                  preview="bg-gradient-to-b from-amber-50 to-amber-100"
                />

                {/* System theme */}
                <ThemeOption
                  icon={<Monitor className="h-3.5 w-3.5" />}
                  label="Hệ thống"
                  description="Theo hệ thống"
                  isActive={theme === "system"}
                  onClick={() => {
                    setTheme("system");
                    setTimeout(() => setIsExpanded(false), 300);
                  }}
                  preview={`bg-gradient-to-b ${
                    resolvedTheme === "dark"
                      ? "from-slate-800 to-slate-900"
                      : "from-sky-50 to-sky-100"
                  }`}
                />

                {/* Dark theme */}
                <ThemeOption
                  icon={<Moon className="h-3.5 w-3.5" />}
                  label="Tối"
                  description="Giao diện tối"
                  isActive={theme === "dark"}
                  onClick={() => {
                    setTheme("dark");
                    setTimeout(() => setIsExpanded(false), 300);
                  }}
                  preview="bg-gradient-to-b from-slate-800 to-slate-900"
                />
              </div>

              {/* Footer */}
              <div className="px-3 py-2 border-t bg-muted/50">
                <p className="text-xs text-muted-foreground text-center">
                  Nhấn{" "}
                  <kbd className="px-1 py-0.5 text-[10px] font-mono border rounded">
                    ESC
                  </kbd>{" "}
                  để đóng
                </p>
              </div>
            </div>

            {/* Mũi tên chỉ về nút toggle */}
            <div
              className={cn(
                "absolute w-3 h-3 bg-popover/80 backdrop-blur-md border",
                popoverStyles.arrow
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Component tùy chọn giao diện
function ThemeOption({
  icon,
  label,
  description,
  isActive,
  onClick,
  preview,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  preview: string;
}) {
  return (
    <button
      className={cn(
        "relative flex flex-col items-center rounded-lg p-2 transition-all",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        isActive ? "bg-accent" : "bg-transparent"
      )}
      onClick={onClick}
      aria-label={description}
    >
      {/* Preview */}
      <div
        className={cn("w-full h-12 rounded-md mb-1.5 overflow-hidden", preview)}
      >
        <div className="w-full h-2 bg-foreground/10 mt-2 mx-auto rounded" />
        <div className="w-3/4 h-2 bg-foreground/10 mt-1 mx-auto rounded" />
        <div className="flex justify-center mt-3">
          <div className="w-8 h-8 rounded-full bg-foreground/20" />
        </div>
      </div>

      {/* Icon and label */}
      <div className="flex items-center justify-center">
        <span
          className={cn(
            "mr-1",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "text-xs font-medium",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </div>

      {/* Active indicator */}
      {isActive && (
        <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
          <Check className="h-2 w-2" />
        </span>
      )}
    </button>
  );
}
