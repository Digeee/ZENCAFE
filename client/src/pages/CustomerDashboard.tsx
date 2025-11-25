// Customer dashboard with order history
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Package, User as UserIcon, LogOut, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const highlightedOrderId = searchParams.get('order');
  
  // Profile state
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    profileImageUrl: user?.profileImageUrl || ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: orderItems = {} } = useQuery<Record<string, OrderItem[]>>({
    queryKey: ["/api/orders/items"],
    enabled: isAuthenticated && orders.length > 0,
  });

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    if (status === "completed") return "default";
    if (status === "processing") return "secondary";
    return "destructive";
  };

  const handleProfileUpdate = () => {
    // In a real implementation, this would call an API to update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-medium" data-testid="dashboard-title">
              My Account
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.firstName || user?.email}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/api/logout"}
            className="gap-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4 space-y-2">
                <div 
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${activeTab === 'orders' ? 'bg-secondary' : 'hover:bg-secondary'}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package className="h-5 w-5" />
                  <span className="font-medium">My Orders</span>
                </div>
                <div 
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${activeTab === 'profile' ? 'bg-secondary' : 'hover:bg-secondary'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Profile</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'orders' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">No orders yet</p>
                        <p className="text-sm text-muted-foreground">
                          Start shopping to see your orders here
                        </p>
                      </div>
                      <Button onClick={() => window.location.href = "/menu"} data-testid="button-start-shopping">
                        Browse Menu
                      </Button>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible defaultValue={highlightedOrderId || undefined}>
                      {orders.map((order) => (
                        <AccordionItem key={order.id} value={order.id} data-testid={`order-${order.id}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex flex-1 items-center justify-between gap-4 pr-4">
                              <div className="text-left space-y-1">
                                <p className="font-medium">
                                  Order #{order.id.substring(0, 8)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-serif font-medium">
                                  ${order.totalAmount}
                                </span>
                                <Badge variant={getStatusVariant(order.status)} data-testid={`order-status-${order.id}`}>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium mb-1">Delivery Address</p>
                                  <p className="text-muted-foreground">{order.deliveryAddress}</p>
                                </div>
                                <div>
                                  <p className="font-medium mb-1">Contact</p>
                                  <p className="text-muted-foreground">{order.customerEmail}</p>
                                  {order.customerPhone && (
                                    <p className="text-muted-foreground">{order.customerPhone}</p>
                                  )}
                                </div>
                              </div>

                              {order.notes && (
                                <div className="text-sm">
                                  <p className="font-medium mb-1">Notes</p>
                                  <p className="text-muted-foreground">{order.notes}</p>
                                </div>
                              )}

                              <Separator />

                              <div className="space-y-2">
                                <p className="font-medium text-sm">Items</p>
                                {orderItems[order.id]?.map((item) => (
                                  <div key={item.id} className="flex justify-between text-sm" data-testid={`order-item-${item.id}`}>
                                    <span className="text-muted-foreground">
                                      {item.quantity}x {item.productName}
                                    </span>
                                    <span className="font-medium">
                                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.profileImageUrl || undefined} />
                        <AvatarFallback className="text-2xl">
                          {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                      )}
                    </div>

                    {/* Profile Form */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          {isEditing ? (
                            <Input
                              id="firstName"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            />
                          ) : (
                            <p className="text-muted-foreground">{profileData.firstName || 'Not provided'}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          {isEditing ? (
                            <Input
                              id="lastName"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            />
                          ) : (
                            <p className="text-muted-foreground">{profileData.lastName || 'Not provided'}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        ) : (
                          <p className="text-muted-foreground">{profileData.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                        {isEditing ? (
                          <Input
                            id="profileImageUrl"
                            value={profileData.profileImageUrl}
                            onChange={(e) => setProfileData({...profileData, profileImageUrl: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                          />
                        ) : (
                          <p className="text-muted-foreground">{profileData.profileImageUrl || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button onClick={handleProfileUpdate}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}