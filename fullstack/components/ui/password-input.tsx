"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Định nghĩa interface riêng, không kế thừa từ InputProps
export interface PasswordInputProps {
  className?: string
  value?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  name?: string
  onChange?: (value: string) => void
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "pr-10",
            className,
          )}
          ref={ref}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <EyeIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>
      </div>
    )
  },
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }

