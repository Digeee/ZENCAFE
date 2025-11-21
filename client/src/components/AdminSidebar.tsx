// Admin sidebar navigation
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { user } = useAuth();

  const menuItems = [
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "customers", label: "Customers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-6 border-b">
        <h2 className="font-serif text-2xl font-medium">Admin Panel</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user?.firstName || user?.email?.split("@")[0] || "Admin"}
        </p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12"
          onClick={() => window.location.href = "/api/logout"}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}