import { serializeUser } from "entities/user/model/serialize-user";
import { createProfileSchema } from "features/profile/model/schemas";
import { cookies } from "next/headers";
import type { ApiFieldErrors } from "shared/api/contracts";
import { db } from "shared/api/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { getMessages } from "shared/lib/i18n/messages";
import { getLocaleFromCookies } from "shared/lib/locale/server";

async function PATCH(request: Request) {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);
  const profileSchema = createProfileSchema(locale);

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return createErrorResponse(
        401,
        "UNAUTHORIZED",
        t.routeErrors.unauthorized,
      );
    }

    const json = await request.json();
    const parsedPayload = profileSchema.safeParse(json);

    if (!parsedPayload.success) {
      const fieldErrors = parsedPayload.error.flatten()
        .fieldErrors as ApiFieldErrors<"name" | "email">;

      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        t.routeErrors.invalidData,
        {
          email: fieldErrors.email?.[0],
          name: fieldErrors.name?.[0],
        },
      );
    }

    const existingUser = await db.user.findFirst({
      where: {
        email: parsedPayload.data.email,
        NOT: {
          id: currentUser.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return createErrorResponse(
        409,
        "EMAIL_EXISTS",
        t.routeErrors.emailExists,
        {
          email: t.routeErrors.emailExists,
        },
      );
    }

    const updatedUser = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: parsedPayload.data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createSuccessResponse({
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error("[profile/update] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      t.routeErrors.internalProfile,
    );
  }
}

export { PATCH };
