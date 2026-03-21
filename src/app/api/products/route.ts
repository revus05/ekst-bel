import { Prisma } from "@prisma/client";
import { serializeProduct } from "entities/product/model/serialize-product";
import { addProductSchema } from "features/add-product";
import { db } from "shared/api/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "shared/api/response";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { isAdmin } from "shared/lib/auth/guards";
import { uploadImageToCloudinary } from "shared/lib/cloudinary";

async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: [
        {
          createdAt: "asc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    return createSuccessResponse({
      products: products.map(serializeProduct),
    });
  } catch (error) {
    console.error("[products/get-all] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "Не удалось получить список продуктов. Попробуйте еще раз.",
    );
  }
}

async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return createErrorResponse(
        401,
        "UNAUTHORIZED",
        "Необходима авторизация.",
      );
    }

    if (!isAdmin(currentUser)) {
      return createErrorResponse(
        403,
        "FORBIDDEN",
        "Только администратор может добавлять продукты.",
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const image = formData.get("image");
    const parsed = addProductSchema.safeParse({
      description,
      image,
      name,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "Проверьте корректность введенных данных.",
        {
          description: fieldErrors.description?.[0],
          image: fieldErrors.image?.[0],
          name: fieldErrors.name?.[0],
        },
      );
    }

    if (!parsed.data.image.type.startsWith("image/")) {
      return createErrorResponse(
        400,
        "INVALID_IMAGE_TYPE",
        "Нужно загрузить файл изображения.",
        {
          image: "Нужно загрузить файл изображения.",
        },
      );
    }

    if (parsed.data.image.size > 5 * 1024 * 1024) {
      return createErrorResponse(
        400,
        "IMAGE_TOO_LARGE",
        "Изображение не должно превышать 5 MB.",
        {
          image: "Изображение не должно превышать 5 MB.",
        },
      );
    }

    const imageUrl = await uploadImageToCloudinary(parsed.data.image);
    const product = await db.product.create({
      data: {
        description: parsed.data.description,
        imageUrl,
        name: parsed.data.name,
      },
      select: {
        createdAt: true,
        description: true,
        id: true,
        imageUrl: true,
        name: true,
      },
    });

    return createSuccessResponse({
      product: serializeProduct(product),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return createErrorResponse(
        409,
        "PRODUCT_ALREADY_EXISTS",
        "Продукт с таким названием уже существует.",
        {
          name: "Продукт с таким названием уже существует.",
        },
      );
    }

    console.error("[products/create] Unexpected error.", error);

    return createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "Не удалось добавить продукт. Проверьте Cloudinary и повторите попытку.",
    );
  }
}

export { GET, POST };
