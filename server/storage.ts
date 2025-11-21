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
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Order operations
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  createOrder(order: Omit<InsertOrder, 'userId'>, userId: string, items: Array<{ productId: string; quantity: number; price: string }>): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Order item operations
  getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]>;
  getOrderItemsForOrders(orderIds: string[]): Promise<Record<string, OrderItem[]>>;

  // Contact message operations
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined>;
}

export class DatabaseStorage implements IStorage {
  // ==================== USER OPERATIONS ====================

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // For MySQL, we need to handle upsert differently
    try {
      await db
        .insert(users)
        .values(userData)
        .onDuplicateKeyUpdate({ set: userData });
      
      // Get the inserted/updated user
      const [user] = await db.select().from(users).where(eq(users.id, userData.id));
      return user;
    } catch (error) {
      console.error("Error upserting user:", error);
      throw error;
    }
  }

  // ==================== CATEGORY OPERATIONS ====================

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.displayOrder, categories.name);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result[0];
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const dataWithId = {
      ...categoryData,
      id: nanoid()
    } as any;
    
    await db.insert(categories).values(dataWithId);
    
    // Get the inserted category
    const [category] = await db.select().from(categories).where(eq(categories.id, dataWithId.id));
    return category;
  }

  // ==================== PRODUCT OPERATIONS ====================

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.featured), desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.slug, slug));
    return result[0];
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const dataWithId = {
      ...productData,
      id: nanoid(),
      slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    } as any;
    
    await db.insert(products).values(dataWithId);
    
    // Get the inserted product
    const [product] = await db.select().from(products).where(eq(products.id, dataWithId.id));
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const updates: any = { ...productData, updatedAt: new Date() };
    if (productData.name && !productData.slug) {
      updates.slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id));
    
    // Get the updated product
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await db.delete(products).where(eq(products.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
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
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(
    orderData: Omit<InsertOrder, 'userId'>,
    userId: string,
    items: Array<{ productId: string; quantity: number; price: string }>
  ): Promise<Order> {
    const dataWithId = {
      ...orderData,
      id: nanoid(),
      userId
    } as any;
    
    await db
      .insert(orders)
      .values(dataWithId);
    
    // Get the inserted order
    const [order] = await db.select().from(orders).where(eq(orders.id, dataWithId.id));

    // Insert order items
    for (const item of items) {
      const product = await this.getProductById(item.productId);
      if (product) {
        const orderItemData = {
          id: nanoid(),
          orderId: order.id,
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          price: item.price
        } as any;
        
        await db.insert(orderItems).values(orderItemData);
      }
    }

    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() } as any)
      .where(eq(orders.id, id));
    
    // Get the updated order
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  // ==================== ORDER ITEM OPERATIONS ====================

  async getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async getOrderItemsForOrders(orderIds: string[]): Promise<Record<string, OrderItem[]>> {
    if (orderIds.length === 0) return {};

    // For now, return empty object as this is complex with Drizzle
    return {};
  }

  // ==================== CONTACT MESSAGE OPERATIONS ====================

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const dataWithId = {
      ...messageData,
      id: nanoid()
    } as any;
    
    await db
      .insert(contactMessages)
      .values(dataWithId);
    
    // Get the inserted message
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, dataWithId.id));
    return message;
  }

  async updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined> {
    await db
      .update(contactMessages)
      .set({ status: status as any, updatedAt: new Date() } as any)
      .where(eq(contactMessages.id, id));
    
    // Get the updated message
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }
}

export const storage = new DatabaseStorage();