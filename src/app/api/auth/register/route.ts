import { Prisma } from "@prisma/client";
import { serializeUser } from "entities/user/model/serialize-user";
import { registerSchema } from "features/auth/model/schemas";
import { db } from "shared/api/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { signAuthToken } from "shared/lib/auth/jwt";
import { hashPassword } from "shared/lib/auth/password";
import { setAuthCookie } from "shared/lib/auth/session";

async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "Проверьте корректность введенных данных.",
        {
          email: fieldErrors.email?.[0],
          name: fieldErrors.name?.[0],
          password: fieldErrors.password?.[0],
        },
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      return createErrorResponse(
        409,
        "EMAIL_ALREADY_EXISTS",
        "Пользователь с таким email уже существует.",
        {
          email: "Пользователь с таким email уже существует.",
        },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await db.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        password: passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = await signAuthToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const response = createSuccessResponse({
      user: serializeUser(user),
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse(
        400,
        "INVALID_JSON",
        "Не удалось прочитать тело запроса.",
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return createErrorResponse(
        409,
        "EMAIL_ALREADY_EXISTS",
        "Пользователь с таким email уже существует.",
        {
          email: "Пользователь с таким email уже существует.",
        },
      );
    }

    console.error("[auth/register] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "Не удалось зарегистрировать пользователя. Попробуйте еще раз.",
    );
  }
}

export { POST };
