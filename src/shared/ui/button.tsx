import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "shared/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[color,box-shadow,background-color,border-color] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-sky-200/25 bg-linear-to-r from-sky-400 via-sky-500 to-blue-700 text-white shadow-[0_22px_52px_-26px_rgba(59,130,246,0.95)] hover:from-sky-300 hover:via-sky-500 hover:to-blue-600",
        outline: "glass-field hover:bg-white/14 hover:text-accent-foreground",
        secondary:
          "border border-sky-200/20 bg-linear-to-r from-sky-300/85 to-blue-600/85 text-white shadow-[0_18px_44px_-26px_rgba(37,99,235,0.9)] hover:from-sky-300 hover:to-blue-500",
        ghost: "bg-white/0 hover:bg-white/10 hover:text-accent-foreground",
        destructive:
          "border border-red-300/20 bg-destructive/90 text-white shadow-[0_18px_48px_-24px_rgba(220,38,38,0.75)] hover:bg-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
