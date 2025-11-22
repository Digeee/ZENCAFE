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

router.get("/api/notes", isAuthenticated, (req: Request, res: Response) => {
  const notes = storage.getNotes();
  res.json(notes);
});

router.post("/api/notes", isAuthenticated, (req: Request, res: Response) => {
  const note = req.body;
  storage.addNote(note);
  res.status(201).send();
});

router.put("/api/notes/:id", isAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const note = req.body;
  storage.updateNote(id, note);
  res.send();
});

router.delete("/api/notes/:id", isAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  storage.deleteNote(id);
  res.send();
});

export default router;
export async function registerRoutes(app: Express) {
  app.use(router);
}
