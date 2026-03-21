import type { Product } from "entities/product/model/types";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "shared/ui/card";

type ProductCardProps = {
  product: Product;
  action?: ReactNode;
};

function ProductCard({ product, action }: ProductCardProps) {
  return (
    <Card className="h-full overflow-hidden">
      {product.imageUrl ? (
        <div className="bg-muted relative aspect-video overflow-hidden border-b">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl">{product.name}</CardTitle>
        <CardDescription className="text-sm leading-6 text-foreground/70 break-all line-clamp-3">
          {product.description}
        </CardDescription>
      </CardHeader>
      {action ? (
        <CardFooter className="pt-0 mt-auto">{action}</CardFooter>
      ) : (
        <CardContent className="pt-0 mt-auto" />
      )}
    </Card>
  );
}

export type { ProductCardProps };
export { ProductCard };
