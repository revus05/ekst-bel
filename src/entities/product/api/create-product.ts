import type { Product } from "entities/product/model/types";
import { apiClient } from "shared/api/api-client";
import type { ApiResponse } from "shared/api/contracts";

type CreateProductPayload = {
  name: string;
  description: string;
  image: File;
};

type CreateProductResponse = {
  product: Product;
};

async function createProduct(payload: CreateProductPayload) {
  const formData = new FormData();

  formData.set("name", payload.name);
  formData.set("description", payload.description);
  formData.set("image", payload.image);

  const response = await apiClient.post<
    ApiResponse<CreateProductResponse, keyof CreateProductPayload>,
    FormData
  >("/api/products", formData);

  if (!response.success) {
    throw new Error("Unexpected API error shape.");
  }

  return response.data.product;
}

export type { CreateProductPayload, CreateProductResponse };
export { createProduct };
