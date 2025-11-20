// Product card component with hover effects
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-300" data-testid={`product-card-${product.id}`}>
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-testid={`product-image-${product.id}`}
          />
          {product.featured && (
            <Badge
              className="absolute top-3 right-3"
              data-testid={`badge-featured-${product.id}`}
            >
              Featured
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4 space-y-2">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif text-lg font-medium line-clamp-1 hover:text-primary transition-colors" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        {product.origin && (
          <p className="text-xs text-muted-foreground">
            Origin: {product.origin}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        <span className="text-2xl font-serif font-medium" data-testid={`product-price-${product.id}`}>
          ${product.price}
        </span>
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(product);
          }}
          disabled={!product.inStock}
          className="gap-2"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
