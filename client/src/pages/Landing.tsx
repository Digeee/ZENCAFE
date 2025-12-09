// Landing page for logged-out users with hero, featured products, and sections
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Coffee, Leaf, Sparkles, Award, Truck, Recycle } from "lucide-react";
import heroImage from "@assets/generated_images/ceylon_tea_plantation_hero.png";
import teaImage from "@assets/generated_images/ceylon_tea_product_shot.png";
import coffeeImage from "@assets/generated_images/coffee_category_image.png";
import pastriesImage from "@assets/generated_images/pastries_category_image.png";
import culturalImage from "@assets/generated_images/tea_picker_cultural_image.png";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true }],
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium text-white" data-testid="hero-title">
            Discover Ceylon's Finest
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Premium coffee and tea from Sri Lanka's pristine highlands
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/menu">
              <Button size="lg" className="gap-2 backdrop-blur-md" data-testid="button-explore-menu">
                Explore Menu
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border-white/30"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-medium" data-testid="section-featured-title">
                Featured Selection
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Handpicked favorites from our premium collection
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 3).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/menu">
                <Button variant="outline" size="lg" className="gap-2" data-testid="button-shop-all">
                  Shop All Products
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-4xl md:text-5xl font-medium" data-testid="section-about-title">
                Ceylon Heritage
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                For generations, Sri Lanka's misty highlands have produced some of the world's finest tea and coffee. At ZEN CAFE, we honor this heritage by sourcing directly from family-owned estates, ensuring every cup tells a story of tradition and excellence.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our commitment to sustainability and fair trade means you can enjoy exceptional flavors while supporting the communities that make it all possible.
              </p>
              <Link href="/about">
                <Button variant="outline" className="gap-2" data-testid="button-learn-more">
                  Learn More About Us
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="relative h-[500px] rounded-xl overflow-hidden">
              <img
                src={culturalImage}
                alt="Traditional tea picking in Ceylon"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-medium" data-testid="section-categories-title">
              Explore Our Collection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From robust coffees to delicate teas and artisanal pastries
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/menu?category=coffee">
              <Card className="group overflow-hidden hover-elevate cursor-pointer transition-all duration-300" data-testid="category-card-coffee">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={coffeeImage}
                    alt="Coffee"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <Coffee className="h-8 w-8 mb-2" />
                    <h3 className="font-serif text-2xl font-medium">Coffee</h3>
                    <p className="text-sm text-white/80 mt-1">Premium Ceylon blends</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/menu?category=tea">
              <Card className="group overflow-hidden hover-elevate cursor-pointer transition-all duration-300" data-testid="category-card-tea">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={teaImage}
                    alt="Tea"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <Leaf className="h-8 w-8 mb-2" />
                    <h3 className="font-serif text-2xl font-medium">Tea</h3>
                    <p className="text-sm text-white/80 mt-1">Authentic Ceylon teas</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/menu?category=pastries">
              <Card className="group overflow-hidden hover-elevate cursor-pointer transition-all duration-300" data-testid="category-card-pastries">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pastriesImage}
                    alt="Pastries"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <Sparkles className="h-8 w-8 mb-2" />
                    <h3 className="font-serif text-2xl font-medium">Pastries</h3>
                    <p className="text-sm text-white/80 mt-1">Traditional treats</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-medium">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                text: "The Ceylon Black Tea is absolutely divine. You can taste the quality in every sip.",
              },
              {
                name: "Michael Rodriguez",
                text: "Best coffee I've had outside of Sri Lanka. The Kithul blend is my new favorite!",
              },
              {
                name: "Amara Patel",
                text: "Authentic flavors and excellent service. ZEN CAFE brings Ceylon to my doorstep.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6" data-testid={`testimonial-${index}`}>
                <CardContent className="space-y-4 p-0">
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <p className="font-medium">— {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-medium">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              What makes ZEN CAFE different
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover-elevate transition-all duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-medium mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">
                We source only the finest Ceylon coffee beans and tea leaves, ensuring exceptional taste in every cup.
              </p>
            </Card>
            <Card className="p-6 text-center hover-elevate transition-all duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-medium mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Freshly roasted and delivered to your door within 48 hours of ordering for the best experience.
              </p>
            </Card>
            <Card className="p-6 text-center hover-elevate transition-all duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Recycle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-medium mb-2">Sustainable Practices</h3>
              <p className="text-muted-foreground">
                Eco-friendly packaging and carbon-neutral shipping to protect our beautiful planet.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12 text-center">
            <div className="space-y-4">
              <h2 className="font-serif text-3xl md:text-4xl font-medium">
                Join Our Community
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Subscribe to receive exclusive offers, new product announcements, and brewing tips.
              </p>
              <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 mt-6">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 rounded-md border border-input bg-background"
                />
                <Button className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">
            Ready to Experience Ceylon?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover the authentic taste of Sri Lanka with our premium selection of coffee, tea, and pastries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button size="lg" className="gap-2">
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}