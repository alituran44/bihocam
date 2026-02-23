"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-teal-500 to-teal-600 text-white",
        secondary: "bg-gray-800 text-white",
        success: "bg-emerald-500 text-white",
        warning: "bg-orange-100 text-orange-800",
        danger: "bg-rose-500 text-white",
        outline: "bg-white border border-gray-300 text-gray-700",
        ghost: "bg-gray-100 text-gray-700",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.625rem] rounded-md",
        md: "px-3 py-1 text-xs rounded-lg",
        lg: "px-4 py-1.5 text-sm rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full mr-1.5",
              variant === "success" && "bg-white",
              variant === "danger" && "bg-rose-500",
              variant === "warning" && "bg-orange-500",
              (!variant || variant === "primary" || variant === "secondary") && "bg-current"
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
