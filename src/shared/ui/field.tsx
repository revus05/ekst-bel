import type * as React from "react";

import { cn } from "shared/lib/utils";
import { Label } from "shared/ui/label";

type FieldProps = React.ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal";
};

function Field({ className, orientation = "vertical", ...props }: FieldProps) {
  return (
    <div
      data-slot="field"
      className={cn(
        "grid gap-2",
        orientation === "horizontal" &&
          "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("grid gap-6", className)}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("data-[invalid=true]:text-destructive", className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

type FieldErrorProps = React.ComponentProps<"div"> & {
  errors?: unknown[];
};

function resolveFieldError(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return null;
}

function FieldError({ className, errors, ...props }: FieldErrorProps) {
  const messages = (errors ?? [])
    .map(resolveFieldError)
    .filter((message): message is string => Boolean(message));

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      data-slot="field-error"
      className={cn("text-destructive text-sm font-medium", className)}
      {...props}
    >
      {messages.join(", ")}
    </div>
  );
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel };
