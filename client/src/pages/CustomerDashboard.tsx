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
import { Package, User as UserIcon, LogOut, Edit, Camera, Calendar, MapPin, Mail, Phone } from "lucide-react";
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
    
    // Initialize profile data when user is available
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profileImageUrl: user.profileImageUrl || ''
      });
    }
  }, [isAuthenticated, authLoading, toast, user]);

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
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground" data-testid="dashboard-title">
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <div className="p-2 rounded-md bg-secondary">
                    <Package className="h-5 w-5" />
                  </div>
                  <span className="font-medium">My Orders</span>
                </div>
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mt-2 ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <div className="p-2 rounded-md bg-secondary">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Profile</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'orders' ? (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-2xl text-foreground">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="mx-auto p-4 rounded-full bg-secondary w-16 h-16 flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-foreground">No orders yet</p>
                        <p className="text-sm text-muted-foreground">
                          Start shopping to see your orders here
                        </p>
                      </div>
                      <Button onClick={() => window.location.href = "/menu"} className="mt-4" data-testid="button-start-shopping">
                        Browse Menu
                      </Button>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible defaultValue={highlightedOrderId || undefined} className="space-y-4">
                      {orders.map((order) => (
                        <AccordionItem key={order.id} value={order.id} className="border rounded-lg overflow-hidden" data-testid={`order-${order.id}`}>
                          <AccordionTrigger className="hover:no-underline px-4 py-3 bg-secondary/50 [&[data-state=open]]:bg-secondary/30">
                            <div className="flex flex-1 items-center justify-between gap-4">
                              <div className="text-left">
                                <p className="font-medium text-foreground">
                                  Order #{order.id.substring(0, 8)}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-serif font-medium text-foreground">
                                  LKR {order.totalAmount}
                                </span>
                                <Badge variant={getStatusVariant(order.status)} className="capitalize" data-testid={`order-status-${order.id}`}>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4 pt-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Delivery Information
                                  </h4>
                                  <div className="space-y-2 pl-6">
                                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                                    </div>
                                    {order.customerPhone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <h4 className="font-medium text-foreground">Order Summary</h4>
                                  <div className="space-y-2 pl-6">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Items:</span>
                                      <span className="font-medium">
                                        {orderItems[order.id]?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                                      </span>
                                    </div>
                                    {order.notes && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Notes:</span>
                                        <span className="font-medium max-w-[150px] truncate" title={order.notes}>
                                          {order.notes}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              <div className="space-y-3">
                                <h4 className="font-medium text-foreground">Order Items</h4>
                                <div className="space-y-2 pl-6">
                                  {orderItems[order.id]?.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm" data-testid={`order-item-${item.id}`}>
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">
                                          {item.quantity}x
                                        </span>
                                        <span className="text-foreground">{item.productName}</span>
                                      </div>
                                      <span className="font-medium text-foreground">
                                        LKR {(parseFloat(item.price) * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
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
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-2xl text-foreground">Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                          <AvatarImage src={profileData.profileImageUrl || undefined} />
                          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                            {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Camera className="h-4 w-4" />
                          Change Photo
                        </Button>
                      )}
                    </div>

                    {/* Profile Form */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                          {isEditing ? (
                            <Input
                              id="firstName"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                              className="py-5"
                            />
                          ) : (
                            <p className="text-muted-foreground py-2">{profileData.firstName || 'Not provided'}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                          {isEditing ? (
                            <Input
                              id="lastName"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                              className="py-5"
                            />
                          ) : (
                            <p className="text-muted-foreground py-2">{profileData.lastName || 'Not provided'}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <div className="py-2">
                          <p className="text-muted-foreground">{profileData.email}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profileImageUrl" className="text-foreground">Profile Image URL</Label>
                        {isEditing ? (
                          <Input
                            id="profileImageUrl"
                            value={profileData.profileImageUrl}
                            onChange={(e) => setProfileData({...profileData, profileImageUrl: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                            className="py-5"
                          />
                        ) : (
                          <p className="text-muted-foreground py-2 break-all">
                            {profileData.profileImageUrl || 'Not provided'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      {isEditing ? (
                        <>
                          <Button onClick={handleProfileUpdate} className="px-6">
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setIsEditing(false);
                            // Reset to original values
                            if (user) {
                              setProfileData({
                                firstName: user.firstName || '',
                                lastName: user.lastName || '',
                                email: user.email || '',
                                profileImageUrl: user.profileImageUrl || ''
                              });
                            }
                          }} className="px-6">
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)} className="gap-2 px-6">
                          <Edit className="h-4 w-4" />
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