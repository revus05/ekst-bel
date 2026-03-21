"use client";

import { useLocale } from "app/providers/locale-provider";
import type { User } from "entities/user/model/types";
import { setUser } from "entities/user/model/user-slice";
import { useRouter } from "next/navigation";
import * as React from "react";
import { apiClient } from "shared/api/api-client";
import { normalizeApiError } from "shared/api/contracts";
import { useForm } from "shared/lib/form";
import { getMessages } from "shared/lib/i18n/messages";
import { useAppDispatch } from "shared/lib/store/hooks";
import { toast } from "shared/lib/toast";
import { Button } from "shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "shared/ui/field";
import { Form } from "shared/ui/form";
import { Input } from "shared/ui/input";

import { createProfileSchema, type ProfileFormValues } from "../model/schemas";

type ProfileSettingsFormProps = {
  user: User;
};

function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { locale } = useLocale();
  const t = getMessages(locale);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const fields = ["name", "email"] as const;
  const profileSchema = React.useMemo(
    () => createProfileSchema(locale),
    [locale],
  );

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
      email: user.email,
      name: user.name,
    } as ProfileFormValues,
    validators: {
      onBlur: profileSchema,
      onSubmit: profileSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      clearApiFieldErrors();
      setSubmitError(null);

      try {
        const payload = await apiClient.patch<
          {
            success: true;
            data: {
              user: User;
            };
          },
          ProfileFormValues
        >("/api/profile", value);

        dispatch(setUser(payload.data.user));
        toast.success(t.profile.submitSuccess);
        formApi.reset(payload.data.user);
        router.refresh();
      } catch (error) {
        const normalizedError = normalizeApiError(error, t.profile.submitError);

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

        setSubmitError(normalizedError.message);
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
        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                data-invalid={field.state.meta.errors.length > 0}
              >
                {t.auth.name}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                aria-invalid={field.state.meta.errors.length > 0}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

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

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <div className="mt-6 grid gap-3">
            {submitError ? (
              <p className="text-destructive text-sm">{submitError}</p>
            ) : null}
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? t.profile.submitting : t.profile.submit}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </Form>
  );
}

export { ProfileSettingsForm };
