"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard, productsQueryOptions } from "entities/product";
import Link from "next/link";
import * as React from "react";
import { normalizeApiError } from "shared/api/contracts";
import { toast } from "shared/lib/toast";
import { Button } from "shared/ui/button";

type ProductListProps = {
  title?: string;
  description?: string;
};

function ProductList({
  title = "Продукты компании",
  description = "Выберите продукт, по которому хотите оставить отзыв, сообщить о баге или предложить улучшение.",
}: ProductListProps) {
  const skeletonIds = [
    "product-skeleton-1",
    "product-skeleton-2",
    "product-skeleton-3",
  ];
  const {
    data: products = [],
    error,
    isLoading,
    refetch,
  } = useQuery(productsQueryOptions());
  const normalizedError = React.useMemo(
    () =>
      error
        ? normalizeApiError(error, "Не удалось загрузить список продуктов.")
        : null,
    [error],
  );
  const errorMessage = normalizedError?.message ?? null;

  React.useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  return (
    <section className="grid gap-6">
      <div className="grid gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground max-w-3xl text-sm leading-6">
          {description}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skeletonIds.map((skeletonId) => (
            <div
              key={skeletonId}
              className="bg-muted/60 h-60 animate-pulse rounded-xl border"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="grid gap-4 rounded-xl border border-dashed p-8 text-center">
          <div className="grid gap-2">
            <h3 className="text-lg font-medium">
              Не удалось загрузить продукты
            </h3>
            <p className="text-muted-foreground text-sm">{errorMessage}</p>
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
            >
              Повторить
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoading && !errorMessage && products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Список продуктов пока пуст.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && products.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              action={
                <Button asChild className="w-full">
                  <Link href={`/feedback/${product.id}`}>Оставить отзыв</Link>
                </Button>
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export type { ProductListProps };
export { ProductList };
