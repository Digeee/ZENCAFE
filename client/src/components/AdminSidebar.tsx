// Admin sidebar navigation
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NotificationCount {
  count: number;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { user } = useAuth();
  
  const { data: notificationCount } = useQuery<NotificationCount>({
    queryKey: ["/api/admin/notifications/unread-count"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const menuItems = [
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "customers", label: "Customers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r shadow-sm">
      <div className="p-6 border-b">
        <h2 className="font-serif text-2xl font-medium text-foreground">Admin Panel</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user?.firstName || user?.email?.split("@")[0] || "Admin"}
        </p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-12 rounded-lg transition-colors ${
                    activeTab === item.id 
                      ? "bg-primary/10 text-primary hover:bg-primary/15" 
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <div className={`p-1.5 rounded-md ${
                    activeTab === item.id ? "bg-primary/20" : "bg-secondary"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {item.id === "orders" && notificationCount && notificationCount.count > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {notificationCount.count}
                    </Badge>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => window.location.href = "/api/logout"}
        >
          <div className="p-1.5 rounded-md bg-secondary">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
}