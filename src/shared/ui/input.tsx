import type * as React from "react";

import { cn } from "shared/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "glass-field file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex h-11 w-full min-w-0 rounded-xl px-3 py-1 text-base outline-none transition-[color,box-shadow,background-color,border-color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[3px] md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
