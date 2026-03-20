import { createSuccessResponse } from "shared/api/response";
import { clearAuthCookie } from "shared/lib/auth/session";

async function POST() {
  const response = createSuccessResponse({ success: true });

  clearAuthCookie(response);

  return response;
}

export { POST };
