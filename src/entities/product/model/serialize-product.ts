import type { Product } from "entities/product/model/types";

type ProductRecord = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  createdAt: Date;
};

function serializeProduct(product: ProductRecord): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt.toISOString(),
  };
}

export { serializeProduct };
