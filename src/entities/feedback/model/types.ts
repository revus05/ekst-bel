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

const feedbackTypeOptions: Array<{ label: string; value: FeedbackType }> = [
  {
    label: "Баг",
    value: "BUG",
  },
  {
    label: "Ошибка",
    value: "ERROR",
  },
  {
    label: "Нелогичность",
    value: "UI_UX",
  },
  {
    label: "Предложение",
    value: "FEATURE_REQUEST",
  },
];

export type {
  CreateFeedbackPayload,
  Feedback,
  FeedbackResponse,
  FeedbackStatus,
  FeedbackType,
};
export { feedbackTypeOptions };
