import express, { type Request, type Response, type Router, type Express } from "express";
import { storage } from "./storage";
import { isAdmin, isAuthenticated } from "./auth";
import { type Product, insertProductSchema, insertCategorySchema, insertOrderSchema } from "@shared/schema";

const router: Router = express.Router();

router.get("/api/categories", async (_req: Request, res: Response) => {
  let categories = await storage.getCategories();
  if (process.env.NODE_ENV === 'development' && categories.length === 0) {
    const defaults = [
      { name: "Coffee", slug: "coffee", description: "Premium Ceylon coffee blends", imageUrl: "/api/placeholder/coffee-category", displayOrder: 1 },
      { name: "Tea", slug: "tea", description: "Finest Ceylon tea selections", imageUrl: "/api/placeholder/tea-category", displayOrder: 2 },
      { name: "Pastries", slug: "pastries", description: "Freshly baked delights", imageUrl: "/api/placeholder/pastries-category", displayOrder: 3 },
    ];
    for (const cat of defaults) {
      await storage.createCategory(cat as any);
    }
    categories = await storage.getCategories();
  }
  res.json(categories);
});

// Public: Products
router.get("/api/products", async (req: Request, res: Response) => {
  const categorySlug = req.query.category as string;
  const featuredParam = req.query.featured;

  let items: Product[];
  if (categorySlug) {
    items = await storage.getProductsByCategorySlug(categorySlug);
  } else {
    items = await storage.getProducts();
  }

  const filtered = featuredParam ? items.filter(p => !!p.featured) : items;
  res.json(filtered);
});

router.get("/api/products/:slug", async (req: Request, res: Response) => {
  const item = await storage.getProductBySlug(req.params.slug);
  if (!item) {
    res.status(404).json({ message: "Not Found" });
    return;
  }
  res.json(item);
});

// Admin: Products CRUD
router.get("/api/admin/products", isAdmin, async (_req: Request, res: Response) => {
  const items = await storage.getProducts();
  res.json(items);
});

router.post("/api/admin/products", isAdmin, async (req: Request, res: Response) => {
  try {
    const productData = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  } catch (e: any) {
    if (e.errors) return res.status(400).json(e);
    res.status(400).json({ message: e?.message || "Failed to create product" });
  }
});

router.put("/api/admin/products/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const productData = insertProductSchema.partial().parse(req.body);
    const product = await storage.updateProduct(req.params.id, productData);
    if (!product) {
      res.status(404).json({ message: "Not Found" });
      return;
    }
    res.json(product);
  } catch (e: any) {
    if (e.errors) return res.status(400).json(e);
    res.status(400).json({ message: e?.message || "Failed to update product" });
  }
});

router.delete("/api/admin/products/:id", isAdmin, async (req: Request, res: Response) => {
  const ok = await storage.deleteProduct(req.params.id);
  if (!ok) {
    res.status(400).json({ message: "Failed to delete product" });
    return;
  }
  res.status(204).send();
});

router.post("/api/admin/categories/seed", isAdmin, async (_req: Request, res: Response) => {
  const categories = await storage.getCategories();
  if (categories.length > 0) {
    res.status(200).json({ message: "Categories already exist", categories });
    return;
  }
  const defaults = [
    { name: "Coffee", slug: "coffee", description: "Premium Ceylon coffee blends", imageUrl: "/api/placeholder/coffee-category", displayOrder: 1 },
    { name: "Tea", slug: "tea", description: "Finest Ceylon tea selections", imageUrl: "/api/placeholder/tea-category", displayOrder: 2 },
    { name: "Pastries", slug: "pastries", description: "Freshly baked delights", imageUrl: "/api/placeholder/pastries-category", displayOrder: 3 },
  ];
  const created: any[] = [];
  for (const cat of defaults) {
    const c = await storage.createCategory(cat as any);
    created.push(c);
  }
  res.status(201).json(created);
});

// Orders: customer checkout and history
router.post("/api/orders", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.claims?.sub || "local-dev-user";
    const body = insertOrderSchema.parse(req.body);
    const { items, ...orderData } = body;

    const order = await storage.createOrder(orderData, userId, items);
    res.status(201).json(order);
  } catch (e: any) {
    if (e.errors) return res.status(400).json(e);
    res.status(400).json({ message: e?.message || "Failed to create order" });
  }
});

router.get("/api/orders", isAuthenticated, async (req: Request, res: Response) => {
  const userId = (req.user as any)?.claims?.sub || "local-dev-user";
  const orders = await storage.getOrdersByUserId(userId);
  res.json(orders);
});

router.get("/api/orders/items", isAuthenticated, async (req: Request, res: Response) => {
  const userId = (req.user as any)?.claims?.sub || "local-dev-user";
  const orders = await storage.getOrdersByUserId(userId);
  const map: Record<string, any[]> = {};
  for (const o of orders) {
    map[o.id] = await storage.getOrderItemsByOrderId(o.id);
  }
  res.json(map);
});

router.get("/api/me", async (req: Request, res: Response) => {
  const user = (req.user as any) || null;
  const isAuthenticated = !!user;
  const isAdmin = !!(user && user.isAdmin);
  res.json({ isAuthenticated, isAdmin, user });
});

// Admin: Orders management
router.get("/api/admin/orders", isAdmin, async (_req: Request, res: Response) => {
  try {
    const orders = await storage.getOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Failed to fetch orders" });
  }
});

router.patch("/api/admin/orders/:id/status", isAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await storage.updateOrderStatus(req.params.id, status);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || "Failed to update order status" });
  }
});

// Admin: Messages management
router.get("/api/admin/messages", isAdmin, async (_req: Request, res: Response) => {
  try {
    const messages = await storage.getContactMessages();
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Failed to fetch messages" });
  }
});

router.patch("/api/admin/messages/:id/status", isAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const message = await storage.updateContactMessageStatus(req.params.id, status);
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    res.json(message);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || "Failed to update message status" });
  }
});

// Admin: Notifications management
router.get("/api/admin/notifications", isAdmin, async (req: Request, res: Response) => {
  try {
    // For now, we'll return all notifications with null userId (admin notifications)
    // In a real implementation, we might have user-specific notifications as well
    const notifications = await storage.getNotifications(null);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Failed to fetch notifications" });
  }
});

router.patch("/api/admin/notifications/:id/read", isAdmin, async (req: Request, res: Response) => {
  try {
    const notification = await storage.markNotificationAsRead(req.params.id);
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.json(notification);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || "Failed to mark notification as read" });
  }
});

router.get("/api/admin/notifications/unread-count", isAdmin, async (req: Request, res: Response) => {
  try {
    // For now, we'll count all unread notifications with null userId (admin notifications)
    const count = await storage.getUnreadNotificationsCount(null);
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Failed to fetch unread notifications count" });
  }
});

// Admin: Users management
router.get("/api/admin/users", isAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Failed to fetch users" });
  }
});

// Placeholder image handler for development
router.get("/api/placeholder/:width/:height", (req: Request, res: Response) => {
  const { width, height } = req.params;
  // Validate dimensions
  if (!/^\d+$/.test(width) || !/^\d+$/.test(height)) {
    return res.status(400).json({ message: "Invalid dimensions" });
  }

  // Redirect to a placeholder service
  res.redirect(`https://placehold.co/${width}x${height}?text=ZEN+CAFE`);
});

router.get("/api/placeholder/:category", (req: Request, res: Response) => {
  const { category } = req.params;
  const validCategories = ['coffee-category', 'tea-category', 'pastries-category', 'new-coffee'];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }

  // Map categories to specific images or use generic placeholders
  const categoryImages: Record<string, string> = {
    'coffee-category': 'https://placehold.co/400x300/8B4513/FFFFFF?text=Coffee',
    'tea-category': 'https://placehold.co/400x300/228B22/FFFFFF?text=Tea',
    'pastries-category': 'https://placehold.co/400x300/D2691E/FFFFFF?text=Pastries',
    'new-coffee': 'https://placehold.co/400x400/8B4513/FFFFFF?text=New+Coffee'
  };

  res.redirect(categoryImages[category]);
});

export default router;
export async function registerRoutes(app: Express) {
  app.use(router);
}
