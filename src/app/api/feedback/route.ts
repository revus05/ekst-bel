import { Prisma } from "@prisma/client";
import { serializeFeedback } from "entities/feedback";
import { feedbackSchema } from "features/submit-feedback/model/schemas";
import { db } from "shared/api/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { sendFeedbackNotification } from "shared/lib/telegram/send-feedback-notification";

async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return createErrorResponse(
        401,
        "UNAUTHORIZED",
        "Необходимо войти в аккаунт для отправки отзыва.",
      );
    }

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "Проверьте корректность введенных данных.",
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
        "Выбранный продукт не найден.",
        {
          productId: "Выбранный продукт не найден.",
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
        "Не удалось прочитать тело запроса.",
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse(
        500,
        "DATABASE_ERROR",
        "Не удалось сохранить отзыв в базе данных.",
      );
    }

    console.error("[feedback/create] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "Не удалось отправить отзыв. Попробуйте еще раз.",
    );
  }
}

export { POST };
