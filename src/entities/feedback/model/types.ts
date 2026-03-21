import { getMessages } from "shared/lib/i18n/messages";
import type { AppLocale } from "shared/lib/locale/constants";

type FeedbackType = "BUG" | "ERROR" | "UI_UX" | "FEATURE_REQUEST";

type FeedbackStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

type Feedback = {
  id: string;
  userId: string;
  productId: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  createdAt: string;
};

type CreateFeedbackPayload = {
  productId: string;
  type: FeedbackType;
  title: string;
  description: string;
};

type FeedbackResponse = {
  feedback: Feedback;
};

function getFeedbackTypeOptions(locale: AppLocale) {
  const t = getMessages(locale);

  return [
    {
      label: t.feedbackType.BUG,
      value: "BUG",
    },
    {
      label: t.feedbackType.ERROR,
      value: "ERROR",
    },
    {
      label: t.feedbackType.UI_UX,
      value: "UI_UX",
    },
    {
      label: t.feedbackType.FEATURE_REQUEST,
      value: "FEATURE_REQUEST",
    },
  ] satisfies Array<{ label: string; value: FeedbackType }>;
}

const feedbackTypeOptions = getFeedbackTypeOptions("ru");

export type {
  CreateFeedbackPayload,
  Feedback,
  FeedbackResponse,
  FeedbackStatus,
  FeedbackType,
};
export { feedbackTypeOptions, getFeedbackTypeOptions };
