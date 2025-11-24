import express, { type Request, type Response, type Router, type Express } from "express";
import { storage } from "./storage";
import { isAdmin, isAuthenticated } from "./auth";

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
  const items = await storage.getProducts();
  const featuredParam = req.query.featured;
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
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  } catch (e: any) {
    res.status(400).json({ message: e?.message || "Failed to create product" });
  }
});

router.put("/api/admin/products/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const product = await storage.updateProduct(req.params.id, req.body);
    if (!product) {
      res.status(404).json({ message: "Not Found" });
      return;
    }
    res.json(product);
  } catch (e: any) {
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
    const { items, ...orderData } = req.body as any;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "Order must contain items" });
      return;
    }
    const order = await storage.createOrder(orderData, userId, items);
    res.status(201).json(order);
  } catch (e: any) {
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
  const dev = process.env.NODE_ENV === 'development';
  const user = (req.user as any) || null;
  const isAuthenticated = dev ? true : !!user;
  const isAdmin = !!(user && user.isAdmin);
  res.json({ isAuthenticated, isAdmin, user });
});

export default router;
export async function registerRoutes(app: Express) {
  app.use(router);
}
