// Cart state management hook
import { useState, useEffect } from "react";
import type { Product } from "@shared/schema";
import { 
  getCart, 
  addToCart as addToCartUtil, 
  updateCartItemQuantity as updateCartUtil,
  removeFromCart as removeFromCartUtil,
  clearCart as clearCartUtil,
  getCartTotal,
  getCartItemCount,
  type CartItem
} from "@/lib/cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    const updatedCart = addToCartUtil(product, quantity);
    setCart(updatedCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const updatedCart = updateCartUtil(productId, quantity);
    setCart(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = removeFromCartUtil(productId);
    setCart(updatedCart);
  };

  const clearCart = () => {
    clearCartUtil();
    setCart([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return {
    cart,
    isOpen,
    openCart,
    closeCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    total: getCartTotal(cart),
    itemCount: getCartItemCount(cart),
  };
}
