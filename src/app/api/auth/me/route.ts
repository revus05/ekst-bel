import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { getCurrentUser } from "shared/lib/auth/get-current-user";

async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return createErrorResponse(
        401,
        "UNAUTHORIZED",
        "Необходима авторизация.",
      );
    }

    return createSuccessResponse({ user });
  } catch (error) {
    console.error("[auth/me] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "Не удалось получить текущего пользователя.",
    );
  }
}

export { GET };
