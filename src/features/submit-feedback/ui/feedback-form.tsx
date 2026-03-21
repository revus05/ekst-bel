"use client";

import { useQuery } from "@tanstack/react-query";
import { feedbackTypeOptions, submitFeedback } from "entities/feedback";
import { productsQueryOptions } from "entities/product";
import { useRouter } from "next/navigation";
import * as React from "react";
import { normalizeApiError } from "shared/api/contracts";
import { useForm } from "shared/lib/form";
import { toast } from "shared/lib/toast";
import { Button } from "shared/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "shared/ui/field";
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

import { type FeedbackFormValues, feedbackSchema } from "../model/schemas";

type FeedbackFormProps = {
  initialProductId?: string;
};

function FeedbackForm({ initialProductId }: FeedbackFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const fields = ["productId", "type", "title", "description"] as const;
  const {
    data: products = [],
    error,
    isLoading: isProductsLoading,
  } = useQuery(productsQueryOptions());
  const normalizedProductsError = React.useMemo(
    () =>
      error
        ? normalizeApiError(error, "Не удалось загрузить список продуктов.")
        : null,
    [error],
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
        toast.success("Отзыв успешно отправлен.");
        formApi.reset();
        formApi.setFieldValue("productId", initialProductId ?? "");
        formApi.setFieldValue("type", "BUG");
        router.refresh();
      } catch (error) {
        const normalizedError = normalizeApiError<keyof FeedbackFormValues>(
          error,
          "Не удалось отправить отзыв.",
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

  const isProductLocked = Boolean(
    initialProductId &&
      products.some((product) => product.id === initialProductId),
  );

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="productId">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                data-invalid={field.state.meta.errors.length > 0}
              >
                Продукт
              </FieldLabel>
              <Select
                value={field.state.value}
                disabled={isProductsLoading || isProductLocked}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={field.state.meta.errors.length > 0}
                >
                  <SelectValue
                    placeholder={
                      isProductsLoading
                        ? "Загрузка продуктов..."
                        : "Выберите продукт"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isProductLocked ? (
                <FieldDescription>
                  Продукт выбран из адреса страницы и зафиксирован.
                </FieldDescription>
              ) : null}
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                data-invalid={field.state.meta.errors.length > 0}
              >
                Тип обращения
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
                  <SelectValue placeholder="Выберите тип обращения" />
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
                Заголовок
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                placeholder="Кратко опишите проблему или предложение"
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
                Подробное описание
              </FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                rows={6}
                value={field.state.value}
                placeholder="Опишите шаги воспроизведения, ожидаемое поведение и важные детали"
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
              {isSubmitting ? "Отправка..." : "Отправить отзыв"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </Form>
  );
}

export type { FeedbackFormProps };
export { FeedbackForm };
