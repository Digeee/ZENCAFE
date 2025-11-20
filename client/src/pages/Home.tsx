// Home page for authenticated users
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Package, ShoppingBag, User as UserIcon, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Order } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user } = useAuth();

  const { data: recentOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { limit: 3 }],
  });

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    if (status === "completed") return "default";
    if (status === "processing") return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Welcome Section */}
        <div className="space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl font-medium" data-testid="welcome-title">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to explore our premium Ceylon coffee and tea collection?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/menu">
            <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-browse-menu">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Browse Menu</CardTitle>
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Explore our full collection of premium products
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-my-orders">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">My Orders</CardTitle>
                <Package className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View your order history and track deliveries
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-my-account">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">My Account</CardTitle>
                <UserIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage your profile and preferences
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl font-medium">Recent Orders</h2>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2" data-testid="button-view-all-orders">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
                <Package className="h-16 w-16 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">No orders yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start your journey with our premium Ceylon products
                  </p>
                </div>
                <Link href="/menu">
                  <Button data-testid="button-start-shopping">
                    Start Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Card key={order.id} data-testid={`order-card-${order.id}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-medium">
                        Order #{order.id.substring(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(order.status)} data-testid={`order-status-${order.id}`}>
                      {order.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <p className="text-2xl font-serif font-medium">
                      ${order.totalAmount}
                    </p>
                    <Link href={`/dashboard?order=${order.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-view-order-${order.id}`}>
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
