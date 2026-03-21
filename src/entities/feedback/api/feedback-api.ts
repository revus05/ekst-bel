import type {
  CreateFeedbackPayload,
  FeedbackResponse,
} from "entities/feedback/model/types";
import { apiClient } from "shared/api/api-client";
import type { ApiResponse } from "shared/api/contracts";

async function submitFeedback(payload: CreateFeedbackPayload) {
  const response = await apiClient.post<
    ApiResponse<FeedbackResponse, keyof CreateFeedbackPayload>,
    CreateFeedbackPayload
  >("/api/feedback", payload);

  if (!response.success) {
    throw new Error("Unexpected API error shape.");
  }

  return response.data.feedback;
}

export { submitFeedback };
