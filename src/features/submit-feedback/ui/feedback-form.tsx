"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "app/providers/locale-provider";
import { getFeedbackTypeOptions, submitFeedback } from "entities/feedback";
import { productsQueryOptions } from "entities/product";
import { useRouter } from "next/navigation";
import * as React from "react";
import { normalizeApiError } from "shared/api/contracts";
import { useForm } from "shared/lib/form";
import { getMessages } from "shared/lib/i18n/messages";
import { toast } from "shared/lib/toast";
import { Button } from "shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "shared/ui/field";
import { Form } from "shared/ui/form";
import { Input } from "shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shared/ui/select";
import { Textarea } from "shared/ui/textarea";

import {
  createFeedbackSchema,
  type FeedbackFormValues,
} from "../model/schemas";

type FeedbackFormProps = {
  initialProductId?: string;
};

function FeedbackForm({ initialProductId }: FeedbackFormProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getMessages(locale);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const fields = ["productId", "type", "title", "description"] as const;
  const feedbackSchema = React.useMemo(
    () => createFeedbackSchema(locale),
    [locale],
  );
  const feedbackTypeOptions = React.useMemo(
    () => getFeedbackTypeOptions(locale),
    [locale],
  );
  const { data: products = [], error } = useQuery(productsQueryOptions());
  const normalizedProductsError = React.useMemo(
    () => (error ? normalizeApiError(error, t.productList.loadError) : null),
    [error, t.productList.loadError],
  );
  const isProductsLoaded = products.length > 0;

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

  React.useEffect(() => {
    if (normalizedProductsError) {
      toast.error(normalizedProductsError.message);
    }
  }, [normalizedProductsError]);

  const form = useForm({
    defaultValues: {
      productId: initialProductId ?? "",
      type: "BUG",
      title: "",
      description: "",
    } as FeedbackFormValues,
    validators: {
      onBlur: feedbackSchema,
      onSubmit: feedbackSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      clearApiFieldErrors();
      setSubmitError(null);

      try {
        await submitFeedback(value);
        toast.success(t.feedback.success);
        formApi.reset();
        formApi.setFieldValue("productId", initialProductId ?? "");
        formApi.setFieldValue("type", "BUG");
        router.refresh();
      } catch (error) {
        const normalizedError = normalizeApiError<keyof FeedbackFormValues>(
          error,
          t.feedback.submitError,
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
        <form.Field name="type">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                data-invalid={field.state.meta.errors.length > 0}
              >
                {t.feedback.type}
              </FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(value as FeedbackFormValues["type"])
                }
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={field.state.meta.errors.length > 0}
                >
                  <SelectValue placeholder={t.feedback.typePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {feedbackTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="title">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                data-invalid={field.state.meta.errors.length > 0}
              >
                {t.feedback.title}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                placeholder={t.feedback.titlePlaceholder}
                aria-invalid={field.state.meta.errors.length > 0}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                data-invalid={field.state.meta.errors.length > 0}
              >
                {t.feedback.description}
              </FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                rows={6}
                value={field.state.value}
                placeholder={t.feedback.descriptionPlaceholder}
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
          <div className="grid gap-3">
            {submitError ? (
              <p className="text-destructive text-sm">{submitError}</p>
            ) : null}
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || !isProductsLoaded}
            >
              {isSubmitting ? t.feedback.sending : t.feedback.send}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </Form>
  );
}

export type { FeedbackFormProps };
export { FeedbackForm };
