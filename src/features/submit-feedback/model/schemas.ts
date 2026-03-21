import type { FeedbackType } from "entities/feedback/model/types";
import { z } from "shared/lib/form";

const feedbackTypeValues = [
  "BUG",
  "ERROR",
  "UI_UX",
  "FEATURE_REQUEST",
] as const satisfies readonly FeedbackType[];

const feedbackSchema = z.object({
  productId: z.string().trim().min(1, "Выберите продукт."),
  type: z.enum(feedbackTypeValues, {
    error: "Выберите тип обращения.",
  }),
  title: z
    .string()
    .trim()
    .min(5, "Заголовок должен содержать минимум 5 символов.")
    .max(120, "Заголовок не должен превышать 120 символов."),
  description: z
    .string()
    .trim()
    .min(20, "Описание должно содержать минимум 20 символов.")
    .max(2000, "Описание не должно превышать 2000 символов."),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export type { FeedbackFormValues };
export { feedbackSchema, feedbackTypeValues };
