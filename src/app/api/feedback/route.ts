import { Prisma } from "@prisma/client";
import { serializeFeedback } from "entities/feedback";
import { createFeedbackSchema } from "features/submit-feedback/model/schemas";
import { cookies } from "next/headers";
import { db } from "shared/api/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { getMessages } from "shared/lib/i18n/messages";
import { getLocaleFromCookies } from "shared/lib/locale/server";
import { sendFeedbackNotification } from "shared/lib/telegram/send-feedback-notification";

async function POST(request: Request) {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);
  const feedbackSchema = createFeedbackSchema(locale);

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return createErrorResponse(401, "UNAUTHORIZED", t.feedback.unauthorized);
    }

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        t.routeErrors.invalidData,
        {
          description: fieldErrors.description?.[0],
          productId: fieldErrors.productId?.[0],
          title: fieldErrors.title?.[0],
          type: fieldErrors.type?.[0],
        },
      );
    }

    const product = await db.product.findUnique({
      where: {
        id: parsed.data.productId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!product) {
      return createErrorResponse(
        404,
        "PRODUCT_NOT_FOUND",
        t.routeErrors.productNotFound,
        {
          productId: t.routeErrors.productNotFound,
        },
      );
    }

    const feedback = await db.feedback.create({
      data: {
        userId: currentUser.id,
        productId: parsed.data.productId,
        type: parsed.data.type,
        title: parsed.data.title,
        description: parsed.data.description,
      },
      select: {
        id: true,
        userId: true,
        productId: true,
        type: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
      },
    });

    try {
      await sendFeedbackNotification({
        authorEmail: currentUser.email,
        authorName: currentUser.name,
        description: feedback.description,
        productName: product.name,
        title: feedback.title,
      });
    } catch (error) {
      console.error("[feedback/create] Failed to send Telegram notification.", {
        error,
        feedbackId: feedback.id,
      });
    }

    return createSuccessResponse({
      feedback: serializeFeedback(feedback),
    });
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
        t.routeErrors.internalFeedback,
      );
    }

    console.error("[feedback/create] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      t.routeErrors.internalFeedback,
    );
  }
}

export { POST };
