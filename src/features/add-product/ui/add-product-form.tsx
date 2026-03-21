"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, productsQueryOptions } from "entities/product";
import Image from "next/image";
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
import { Textarea } from "shared/ui/textarea";

import { type AddProductFormValues, addProductSchema } from "../model/schemas";

function AddProductForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(
    null,
  );
  const fields = ["name", "description", "image"] as const;
  const createProductMutation = useMutation({
    mutationFn: createProduct,
  });

  const form = useForm({
    defaultValues: {
      description: "",
      image: undefined as unknown as File,
      name: "",
    } as AddProductFormValues,
    validators: {
      onBlur: addProductSchema,
      onSubmit: addProductSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      clearApiFieldErrors();
      setSubmitError(null);

      try {
        await createProductMutation.mutateAsync(value);
        await queryClient.invalidateQueries({
          queryKey: productsQueryOptions().queryKey,
        });
        toast.success("Продукт успешно добавлен.");
        setImagePreviewUrl(null);
        formApi.reset();
        router.push("/");
        router.refresh();
      } catch (error) {
        const normalizedError = normalizeApiError<keyof AddProductFormValues>(
          error,
          "Не удалось добавить продукт.",
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
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

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
                Название продукта
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                aria-invalid={field.state.meta.errors.length > 0}
                placeholder="Например, EKST Support Desk"
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
                Описание
              </FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                rows={5}
                value={field.state.value}
                aria-invalid={field.state.meta.errors.length > 0}
                placeholder="Кратко опишите, для чего нужен продукт и какую задачу он решает."
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="image">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                data-invalid={field.state.meta.errors.length > 0}
              >
                Изображение
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                aria-invalid={field.state.meta.errors.length > 0}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const nextFile = event.target.files?.[0];

                  if (!nextFile) {
                    field.handleChange(undefined as unknown as File);
                    return;
                  }

                  if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl);
                  }

                  setImagePreviewUrl(URL.createObjectURL(nextFile));
                  field.handleChange(nextFile);
                }}
              />
              <FieldDescription>
                Поддерживаются `PNG`, `JPG`, `JPEG`, `WEBP` до 5 MB.
              </FieldDescription>
              {imagePreviewUrl ? (
                <div className="bg-muted relative max-w-sm overflow-hidden rounded-xl border">
                  <Image
                    src={imagePreviewUrl}
                    alt="Предпросмотр изображения продукта"
                    unoptimized
                    width={640}
                    height={360}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
              ) : null}
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
              {isSubmitting ? "Добавление..." : "Добавить продукт"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </Form>
  );
}

export { AddProductForm };
