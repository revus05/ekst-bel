import { serializeUser } from "entities/user/model/serialize-user";
import { loginSchema } from "features/auth/model/schemas";
import { db } from "shared/api/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { signAuthToken } from "shared/lib/auth/jwt";
import { verifyPassword } from "shared/lib/auth/password";
import { setAuthCookie } from "shared/lib/auth/session";

async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "Проверьте корректность введенных данных.",
        {
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        },
      );
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return createErrorResponse(
        401,
        "INVALID_CREDENTIALS",
        "Неверный email или пароль.",
        {
          password: "Неверный email или пароль.",
        },
      );
    }

    const isPasswordValid = await verifyPassword(
      parsed.data.password,
      user.password,
    );

    if (!isPasswordValid) {
      return createErrorResponse(
        401,
        "INVALID_CREDENTIALS",
        "Неверный email или пароль.",
        {
          password: "Неверный email или пароль.",
        },
      );
    }

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

    console.error("[auth/login] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "Не удалось выполнить вход. Попробуйте еще раз.",
    );
  }
}

export { POST };
