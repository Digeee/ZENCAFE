// Main app component with routing and layout
import { Switch, Route } from "wouter";
import { queryClient, AuthProvider } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/menu" component={Menu} />
          <Route path="/product/:slug" component={ProductDetail} />
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/dashboard" component={CustomerDashboard} />
          <Route path="/admin" component={EnhancedAdminDashboard} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/menu" component={Menu} />
          <Route path="/product/:slug" component={ProductDetail} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/dashboard" component={CustomerDashboard} />
          <Route path="/admin" component={EnhancedAdminDashboard} />
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function AppContent() {
  const cart = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Header cartItemCount={cart.itemCount} onCartClick={cart.openCart} />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
      <CartDrawer
        isOpen={cart.isOpen}
        onClose={cart.closeCart}
        cart={cart.cart}
        total={cart.total}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
      />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;