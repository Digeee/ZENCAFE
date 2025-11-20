// Database storage implementation with all CRUD operations
import {
  users,
  categories,
  products,
  orders,
  orderItems,
  contactMessages,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getAllProducts(filters?: { categoryId?: string; search?: string; featured?: boolean }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Order operations
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: Omit<InsertOrder, 'userId'>, userId: string, items: Array<{ productId: string; quantity: number; price: string }>): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Order item operations
  getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]>;
  getOrderItemsForOrders(orderIds: string[]): Promise<Record<string, OrderItem[]>>;

  // Contact message operations
  getAllContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
}

export class DatabaseStorage implements IStorage {
  // ==================== USER OPERATIONS ====================

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // ==================== CATEGORY OPERATIONS ====================

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.displayOrder, categories.name);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // ==================== PRODUCT OPERATIONS ====================

  async getAllProducts(filters?: { categoryId?: string; search?: string; featured?: boolean }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (filters?.categoryId) {
      const category = await this.getCategoryBySlug(filters.categoryId);
      if (category) {
        conditions.push(eq(products.categoryId, category.id));
      }
    }
    
    if (filters?.search) {
      conditions.push(
        sql`(${products.name} ILIKE ${`%${filters.search}%`} OR ${products.description} ILIKE ${`%${filters.search}%`})`
      );
    }
    
    if (filters?.featured !== undefined) {
      conditions.push(eq(products.featured, filters.featured));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(products.featured), desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    // Generate slug from name
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const [product] = await db.insert(products).values({
      ...productData,
      slug,
    }).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    // Generate slug if name is being updated
    const updates: any = { ...productData, updatedAt: new Date() };
    if (productData.name) {
      updates.slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ==================== ORDER OPERATIONS ====================

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(
    orderData: Omit<InsertOrder, 'userId'>,
    userId: string,
    items: Array<{ productId: string; quantity: number; price: string }>
  ): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values({
        ...orderData,
        userId,
      })
      .returning();

    // Insert order items
    for (const item of items) {
      const product = await this.getProductById(item.productId);
      if (product) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          price: item.price,
        });
      }
    }

    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // ==================== ORDER ITEM OPERATIONS ====================

  async getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async getOrderItemsForOrders(orderIds: string[]): Promise<Record<string, OrderItem[]>> {
    if (orderIds.length === 0) return {};

    const items = await db
      .select()
      .from(orderItems)
      .where(sql`${orderItems.orderId} = ANY(${orderIds})`);

    const result: Record<string, OrderItem[]> = {};
    for (const item of items) {
      if (!result[item.orderId]) {
        result[item.orderId] = [];
      }
      result[item.orderId].push(item);
    }
    return result;
  }

  // ==================== CONTACT MESSAGE OPERATIONS ====================

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(messageData)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
