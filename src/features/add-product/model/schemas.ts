import { z } from "shared/lib/form";

const productNameSchema = z
  .string()
  .trim()
  .min(2, "Название должно содержать минимум 2 символа.")
  .max(100, "Название не должно превышать 100 символов.");

const productDescriptionSchema = z
  .string()
  .trim()
  .min(20, "Описание должно содержать минимум 20 символов.")
  .max(1000, "Описание не должно превышать 1000 символов.");

const productImageSchema = z.custom<File>(
  (value) => value instanceof File && value.size > 0,
  "Загрузите изображение продукта.",
);

const addProductSchema = z.object({
  name: productNameSchema,
  description: productDescriptionSchema,
  image: productImageSchema,
});

type AddProductFormValues = z.infer<typeof addProductSchema>;

export type { AddProductFormValues };
export { addProductSchema, productDescriptionSchema, productNameSchema };
