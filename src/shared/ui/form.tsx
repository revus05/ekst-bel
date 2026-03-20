import type * as React from "react";

import { cn } from "shared/lib/utils";

type FormProps = React.ComponentProps<"form"> & {
  noValidate?: boolean;
};

function Form({ className, noValidate = true, ...props }: FormProps) {
  return (
    <form
      data-slot="form"
      noValidate={noValidate}
      className={cn("grid gap-6", className)}
      {...props}
    />
  );
}

export { Form };
