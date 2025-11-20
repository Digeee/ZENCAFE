// Product detail page with image, details, and add to cart
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Minus, Plus, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug || "";
  const [quantity, setQuantity] = useState(1);
  const { addToCart, openCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch product");
      }
      return res.json();
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your cart.`,
    });
    openCart();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-lg text-muted-foreground mb-6">Product not found</p>
          <Link href="/menu">
            <Button>Back to Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <Link href="/menu">
          <Button variant="ghost" className="gap-2 mb-8" data-testid="button-back">
            <ChevronLeft className="h-4 w-4" />
            Back to Menu
          </Button>
        </Link>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              data-testid="product-image"
            />
            {product.featured && (
              <Badge className="absolute top-4 right-4" data-testid="badge-featured">
                Featured
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-serif text-4xl md:text-5xl font-medium" data-testid="product-name">
                {product.name}
              </h1>
              {product.origin && (
                <p className="text-sm text-muted-foreground">
                  Origin: {product.origin}
                </p>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif font-medium" data-testid="product-price">
                ${product.price}
              </span>
              {!product.inStock && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="font-serif text-xl font-medium">Description</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="product-description">
                {product.description}
              </p>
            </div>

            {product.brewingSuggestions && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h2 className="font-serif text-xl font-medium">Brewing Suggestions</h2>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {product.brewingSuggestions}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            <Separator />

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium" data-testid="quantity-display">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart - ${(parseFloat(product.price) * quantity).toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
