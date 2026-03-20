import { NextResponse } from "next/server";

import type { ApiFieldErrors, ApiResponse } from "shared/api/contracts";

function createSuccessResponse<TData>(data: TData, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<TData>>(
    {
      success: true,
      data,
    },
    init,
  );
}

function createErrorResponse<TField extends string = string>(
  status: number,
  code: string,
  message: string,
  fieldErrors?: ApiFieldErrors<TField>,
) {
  return NextResponse.json<ApiResponse<never, TField>>(
    {
      success: false,
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    },
    { status },
  );
}

export { createErrorResponse, createSuccessResponse };
