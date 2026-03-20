"use client";

import { loginUser } from "entities/user/api/auth-api";
import { setUser } from "entities/user/model/user-slice";
import { useRouter } from "next/navigation";
import * as React from "react";
import { normalizeApiError } from "shared/api/contracts";
import { useForm } from "shared/lib/form";
import { useAppDispatch } from "shared/lib/store/hooks";
import { toast } from "shared/lib/toast";
import { Button } from "shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "shared/ui/field";
import { Form } from "shared/ui/form";
import { Input } from "shared/ui/input";

import { type LoginFormValues, loginSchema } from "../model/schemas";

function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const fields = ["email", "password"] as const;

  function clearApiFieldErrors() {
    for (const fieldName of fields) {
      form.setFieldMeta(fieldName, (previousMeta) => ({
        ...previousMeta,
        errorMap: {
          ...previousMeta.errorMap,
          onSubmit: undefined,
        },
      }));
    }
  }

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginFormValues,
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      clearApiFieldErrors();
      setSubmitError(null);

      try {
        const response = await loginUser(value);

        dispatch(setUser(response.user));
        toast.success("Вы успешно вошли в аккаунт.");
        router.push("/");
        router.refresh();
      } catch (error) {
        const normalizedError = normalizeApiError<keyof LoginFormValues>(
          error,
          "Не удалось выполнить вход.",
        );

        setSubmitError(normalizedError.message);

        for (const fieldName of fields) {
          const fieldError = normalizedError.fieldErrors[fieldName];

          if (!fieldError) {
            continue;
          }

          formApi.setFieldMeta(fieldName, (previousMeta) => ({
            ...previousMeta,
            errorMap: {
              ...previousMeta.errorMap,
              onSubmit: fieldError,
            },
          }));
        }

        toast.error(normalizedError.message);
      }
    },
  });

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                data-invalid={field.state.meta.errors.length > 0}
              >
                Email
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                value={field.state.value}
                aria-invalid={field.state.meta.errors.length > 0}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                data-invalid={field.state.meta.errors.length > 0}
              >
                Пароль
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                aria-invalid={field.state.meta.errors.length > 0}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>
      </FieldGroup>

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <div className="grid gap-3">
            {submitError ? (
              <p className="text-destructive text-sm">{submitError}</p>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Вход..." : "Войти"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </Form>
  );
}

export { LoginForm };
