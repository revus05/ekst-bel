import type { ProductsResponse } from "entities/product/model/types";
import { apiClient } from "shared/api/api-client";
import type { ApiResponse } from "shared/api/contracts";

async function getProducts() {
  const response =
    await apiClient.get<ApiResponse<ProductsResponse>>("/api/products");

  if (!response.success) {
    throw new Error("Unexpected API error shape.");
  }

  return response.data.products;
}

export { getProducts };
