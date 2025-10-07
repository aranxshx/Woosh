"use client";

import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { VariantProps, cva } from "class-variance-authority";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const buttonVariants = cva(
  "relative inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-zinc-300 text-zinc-900 hover:bg-zinc-100 active:bg-zinc-50 shadow-[0_12px_32px_rgba(24,24,27,0.45)]",
        secondary:
          "bg-zinc-800/70 text-zinc-200 hover:bg-zinc-700/80 border border-white/10",
        ghost: "bg-transparent text-zinc-300 hover:bg-white/5",
        destructive: "bg-red-500 text-white hover:bg-red-400",
      },
      size: {
        sm: "h-9 rounded-xl px-4 text-sm",
        md: "h-11 rounded-2xl px-5 text-base",
        lg: "h-12 rounded-2xl px-6 text-lg",
        pill: "h-10 rounded-full px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
