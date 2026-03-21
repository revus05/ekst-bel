import type { FeedbackType } from "entities/feedback/model/types";
import { z } from "shared/lib/form";
import { getMessages } from "shared/lib/i18n/messages";
import type { AppLocale } from "shared/lib/locale/constants";

const feedbackTypeValues = [
  "BUG",
  "ERROR",
  "UI_UX",
  "FEATURE_REQUEST",
] as const satisfies readonly FeedbackType[];

function createFeedbackSchema(locale: AppLocale) {
  const t = getMessages(locale);

  return z.object({
    productId: z.string().trim().min(1, t.validation.chooseProduct),
    type: z.enum(feedbackTypeValues, {
      error: t.validation.chooseFeedbackType,
    }),
    title: z
      .string()
      .trim()
      .min(5, t.validation.titleMin5)
      .max(120, t.validation.titleMax120),
    description: z.string().trim().max(2000, t.validation.descriptionMax2000),
  });
}

const feedbackSchema = createFeedbackSchema("ru");

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export type { FeedbackFormValues };
export { createFeedbackSchema, feedbackSchema, feedbackTypeValues };
