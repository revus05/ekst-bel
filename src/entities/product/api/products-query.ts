import { queryOptions } from "@tanstack/react-query";

import { getProducts } from "entities/product/api/get-products";

function productsQueryOptions() {
  return queryOptions({
    queryFn: getProducts,
    queryKey: ["products"] as const,
  });
}

export { productsQueryOptions };
