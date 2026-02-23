"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium text-[0.9375rem] rounded-xl transition-all duration-200 cursor-pointer border-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-[0_4px_14px_-3px_rgba(13,148,136,0.4)] hover:shadow-[0_8px_20px_-4px_rgba(13,148,136,0.5)] hover:-translate-y-0.5",
        secondary:
          "bg-gray-900 text-white hover:bg-gray-800 hover:-translate-y-0.5",
        outline:
          "bg-transparent border-2 border-gray-200 text-gray-900 hover:border-teal-500 hover:text-teal-600",
        ghost:
          "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        link: "bg-transparent text-teal-600 hover:text-teal-700 underline-offset-4 hover:underline",
        danger:
          "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_4px_14px_-3px_rgba(244,63,94,0.4)] hover:shadow-[0_8px_20px_-4px_rgba(244,63,94,0.5)] hover:-translate-y-0.5",
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-5 py-2.5",
        lg: "px-6 py-3 text-base",
        xl: "px-8 py-4 text-lg",
        icon: "p-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asMotion?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      asMotion = true,
      ...props
    },
    ref
  ) => {
    const content = (
      <>
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </>
    );

    if (asMotion) {
      return (
        <motion.button
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          disabled={disabled || isLoading}
          whileTap={{ scale: 0.98 }}
          {...(props as HTMLMotionProps<"button">)}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
