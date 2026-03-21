import { z } from "shared/lib/form";
import { getMessages } from "shared/lib/i18n/messages";
import type { AppLocale } from "shared/lib/locale/constants";

function createAuthSchemas(locale: AppLocale) {
  const t = getMessages(locale);

  const emailSchema = z
    .string()
    .trim()
    .email(t.validation.emailInvalid)
    .transform((value) => value.toLowerCase());

  const passwordSchema = z
    .string()
    .min(8, t.validation.passwordMin8)
    .max(100, t.validation.passwordMax100);

  const nameSchema = z
    .string()
    .trim()
    .min(2, t.validation.nameMin2)
    .max(50, t.validation.nameMax50);

  return {
    loginSchema: z.object({
      email: emailSchema,
      password: passwordSchema,
    }),
    registerSchema: z.object({
      name: nameSchema,
      email: emailSchema,
      password: passwordSchema,
    }),
  };
}

const { loginSchema, registerSchema } = createAuthSchemas("ru");

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export type { LoginFormValues, RegisterFormValues };
export { createAuthSchemas, loginSchema, registerSchema };
