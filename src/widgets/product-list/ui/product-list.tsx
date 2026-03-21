"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "app/providers/locale-provider";
import { ProductCard, productsQueryOptions } from "entities/product";
import Link from "next/link";
import * as React from "react";
import { normalizeApiError } from "shared/api/contracts";
import { getMessages } from "shared/lib/i18n/messages";
import { toast } from "shared/lib/toast";
import { Button } from "shared/ui/button";
import { Input } from "shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shared/ui/select";

function ProductList() {
  const { locale } = useLocale();
  const t = getMessages(locale);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
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
    () => (error ? normalizeApiError(error, t.productList.loadError) : null),
    [error, t.productList.loadError],
  );
  const errorMessage = normalizedError?.message ?? null;

  React.useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  const filteredProducts = React.useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase(locale);

    const nextProducts = products.filter((product) => {
      if (!normalizedQuery) {
        return true;
      }

      return [product.name, product.description].some((value) =>
        value.toLocaleLowerCase(locale).includes(normalizedQuery),
      );
    });

    return nextProducts.sort((left, right) => {
      const result = left.name.localeCompare(right.name, locale);

      return sortOrder === "asc" ? result : -result;
    });
  }, [locale, products, searchQuery, sortOrder]);

  return (
    <section className="grid gap-6">
      <div className="grid gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t.home.productsTitle}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-sm leading-6">
          {t.home.productsDescription}
        </p>
      </div>

      <div className="glass-panel grid gap-4 rounded-[1.5rem] p-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-2">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
            {t.productList.searchLabel}
          </span>
          <Input
            value={searchQuery}
            placeholder={t.productList.searchPlaceholder}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
            {t.productList.sortLabel}
          </span>
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t.productList.sortAsc}</SelectItem>
              <SelectItem value="desc">{t.productList.sortDesc}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skeletonIds.map((skeletonId) => (
            <div
              key={skeletonId}
              className="glass-panel h-60 animate-pulse rounded-[1.5rem]"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="glass-panel grid gap-4 rounded-[1.5rem] border-dashed p-8 text-center">
          <div className="grid gap-2">
            <h3 className="text-lg font-medium">{t.productList.loadError}</h3>
            <p className="text-muted-foreground text-sm">{errorMessage}</p>
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
            >
              {t.productList.retry}
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoading && !errorMessage && products.length === 0 ? (
        <div className="glass-panel rounded-[1.5rem] border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {t.productList.emptyList}
          </p>
        </div>
      ) : null}

      {!isLoading &&
      !errorMessage &&
      products.length > 0 &&
      filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-[1.5rem] border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">{t.productList.empty}</p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && filteredProducts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              action={
                <Button asChild className="w-full">
                  <Link href={`/feedback/${product.id}`}>
                    {t.productList.submit}
                  </Link>
                </Button>
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export { ProductList };
