import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { db } from "shared/api/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { isAdmin } from "shared/lib/auth/guards";
import { getMessages } from "shared/lib/i18n/messages";
import { getLocaleFromCookies } from "shared/lib/locale/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function PATCH(request: Request, { params }: RouteContext) {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !isAdmin(currentUser)) {
      return createErrorResponse(403, "FORBIDDEN", t.routeErrors.adminOnly);
    }

    const { id } = await params;
    const body = await request.json();
    const { status, title, description } = body as {
      status?: string;
      title?: string;
      description?: string;
    };

    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED"];
    if (status !== undefined && !validStatuses.includes(status)) {
      return createErrorResponse(
        400,
        "INVALID_STATUS",
        t.routeErrors.invalidData,
      );
    }

    const existing = await db.feedback.findUnique({ where: { id } });

    if (!existing) {
      return createErrorResponse(
        404,
        "FEEDBACK_NOT_FOUND",
        t.routeErrors.feedbackNotFound,
      );
    }

    const updated = await db.feedback.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        type: true,
      },
    });

    return createSuccessResponse({ feedback: updated });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse(
        400,
        "INVALID_JSON",
        t.routeErrors.invalidJson,
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse(
        500,
        "DATABASE_ERROR",
        t.routeErrors.internalUpdateFeedback,
      );
    }

    console.error("[feedback/update] Unexpected error.", error);
    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      t.routeErrors.internalUpdateFeedback,
    );
  }
}

async function DELETE(_request: Request, { params }: RouteContext) {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !isAdmin(currentUser)) {
      return createErrorResponse(403, "FORBIDDEN", t.routeErrors.adminOnly);
    }

    const { id } = await params;

    const existing = await db.feedback.findUnique({ where: { id } });

    if (!existing) {
      return createErrorResponse(
        404,
        "FEEDBACK_NOT_FOUND",
        t.routeErrors.feedbackNotFound,
      );
    }

    await db.feedback.delete({ where: { id } });

    return createSuccessResponse({ id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse(
        500,
        "DATABASE_ERROR",
        t.routeErrors.internalDeleteFeedback,
      );
    }

    console.error("[feedback/delete] Unexpected error.", error);
    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      t.routeErrors.internalDeleteFeedback,
    );
  }
}

export { DELETE, PATCH };
