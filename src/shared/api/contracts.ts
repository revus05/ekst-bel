import { ApiClientError } from "shared/api/api-client";

type ApiFieldErrors<TField extends string = string> = Partial<
  Record<TField, string>
>;

type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
};

type ApiErrorData<TField extends string = string> = {
  code: string;
  message: string;
  fieldErrors?: ApiFieldErrors<TField>;
};

type ApiErrorResponse<TField extends string = string> = {
  success: false;
  error: ApiErrorData<TField>;
};

type ApiResponse<TData, TField extends string = string> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse<TField>;

type NormalizedApiError<TField extends string = string> = {
  code: string;
  message: string;
  fieldErrors: ApiFieldErrors<TField>;
};

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === false &&
    "error" in value
  );
}

function normalizeApiError<TField extends string = string>(
  error: unknown,
  fallbackMessage = "Что-то пошло не так. Попробуйте еще раз.",
): NormalizedApiError<TField> {
  if (error instanceof ApiClientError && isApiErrorResponse(error.payload)) {
    return {
      code: error.payload.error.code,
      message: error.payload.error.message || fallbackMessage,
      fieldErrors:
        (error.payload.error.fieldErrors as
          | ApiFieldErrors<TField>
          | undefined) ?? {},
    };
  }

  if (error instanceof Error && error.message) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      fieldErrors: {},
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: fallbackMessage,
    fieldErrors: {},
  };
}

export type {
  ApiErrorData,
  ApiErrorResponse,
  ApiFieldErrors,
  ApiResponse,
  ApiSuccessResponse,
  NormalizedApiError,
};
export { isApiErrorResponse, normalizeApiError };
