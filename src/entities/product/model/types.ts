type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
};

type ProductsResponse = {
  products: Product[];
};

export type { Product, ProductsResponse };
