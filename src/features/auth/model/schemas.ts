import { z } from "shared/lib/form";

const emailSchema = z
  .string()
  .trim()
  .email("Введите корректный email.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Пароль должен содержать минимум 8 символов.")
  .max(100, "Пароль не должен превышать 100 символов.");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Имя должно содержать минимум 2 символа.")
  .max(50, "Имя не должно превышать 50 символов.");

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export type { LoginFormValues, RegisterFormValues };
export { loginSchema, registerSchema };
