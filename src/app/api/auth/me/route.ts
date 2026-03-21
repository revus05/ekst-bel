import { cookies } from "next/headers";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { getMessages } from "shared/lib/i18n/messages";
import { getLocaleFromCookies } from "shared/lib/locale/server";

async function GET() {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);

  try {
    const user = await getCurrentUser();

    if (!user) {
      return createErrorResponse(
        401,
        "UNAUTHORIZED",
        t.routeErrors.unauthorized,
      );
    }

    return createSuccessResponse({ user });
  } catch (error) {
    console.error("[auth/me] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      t.routeErrors.internalMe,
    );
  }
}

export { GET };
