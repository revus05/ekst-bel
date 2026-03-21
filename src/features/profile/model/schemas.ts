import { getMessages } from "shared/lib/i18n/messages";
import type { AppLocale } from "shared/lib/locale/constants";
import { z } from "zod";

function createProfileSchema(locale: AppLocale) {
  const t = getMessages(locale);

  return z.object({
    email: z.email(t.validation.emailInvalid),
    name: z
      .string()
      .trim()
      .min(2, t.validation.nameMin2)
      .max(80, t.validation.nameMax80),
  });
}

const profileSchema = createProfileSchema("ru");

type ProfileFormValues = z.infer<typeof profileSchema>;

export type { ProfileFormValues };
export { createProfileSchema, profileSchema };
