import type { Feedback, FeedbackStatus, FeedbackType } from "./types";

type FeedbackRecord = {
  id: string;
  userId: string;
  productId: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  createdAt: Date;
};

function serializeFeedback(feedback: FeedbackRecord): Feedback {
  return {
    id: feedback.id,
    userId: feedback.userId,
    productId: feedback.productId,
    type: feedback.type,
    title: feedback.title,
    description: feedback.description,
    status: feedback.status,
    createdAt: feedback.createdAt.toISOString(),
  };
}

export { serializeFeedback };
