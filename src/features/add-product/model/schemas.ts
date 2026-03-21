import { z } from "shared/lib/form";
import { getMessages } from "shared/lib/i18n/messages";
import type { AppLocale } from "shared/lib/locale/constants";

function createAddProductSchema(locale: AppLocale) {
  const t = getMessages(locale);

  const productNameSchema = z
    .string()
    .trim()
    .min(2, t.validation.productNameMin2)
    .max(100, t.validation.productNameMax100);

  const productDescriptionSchema = z
    .string()
    .trim()
    .max(1000, t.validation.descriptionMax1000);

  const productImageSchema = z.custom<File>(
    (value) => value instanceof File && value.size > 0,
    t.validation.uploadProductImage,
  );

  return {
    addProductSchema: z.object({
      name: productNameSchema,
      description: productDescriptionSchema,
      image: productImageSchema,
    }),
    productDescriptionSchema,
    productNameSchema,
  };
}

const { addProductSchema, productDescriptionSchema, productNameSchema } =
  createAddProductSchema("ru");

type AddProductFormValues = z.infer<typeof addProductSchema>;

export type { AddProductFormValues };
export {
  addProductSchema,
  createAddProductSchema,
  productDescriptionSchema,
  productNameSchema,
};
