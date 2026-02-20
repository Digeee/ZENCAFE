// Database storage implementation with all CRUD operations
import {
  users,
  categories,
  products,
  orders,
  orderItems,
  contactMessages,
  notifications,
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
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, sql, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendOrderNotification, sendContactNotification } from "./email";

const ADMIN_EMAIL = "digee12@gmail.com";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProductsByCategorySlug(categorySlug: string): Promise<Product[]>;
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

  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // ==================== USER OPERATIONS ====================

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Force admin rights for specific email
    if (userData.email === ADMIN_EMAIL) {
      userData.isAdmin = true;
    }

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

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.featured), desc(products.createdAt));
  }

  async getProductsByCategorySlug(categorySlug: string): Promise<Product[]> {
    // Join products with categories to filter by slug
    const rows = await db
      .select()
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(categories.slug, categorySlug))
      .orderBy(desc(products.featured), desc(products.createdAt));

    return rows.map((r: any) => r.products);
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
    orderData: Omit<InsertOrder, 'userId' | 'items'>,
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

    // Create notification for admins about the new order
    const totalAmount = parseFloat(order.totalAmount).toFixed(2);
    const notificationMessage = `New order #${order.id.substring(0, 8)} placed by ${order.customerName} for LKR ${totalAmount}`;

    // In a real implementation, we would notify all admins
    // For now, we'll create a notification that can be fetched by the admin panel
    await this.createNotification({
      type: "order_placed",
      title: "New Order Placed",
      message: notificationMessage,
      entityId: order.id,
      userId: null // Null indicates it's for all admins
    } as any);

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

  // ==================== NOTIFICATION OPERATIONS ====================

  async getNotifications(userId: string | null): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(userId ? eq(notifications.userId, userId) : isNull(notifications.userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const dataWithId = {
      ...notificationData,
      id: nanoid()
    } as any;

    await db
      .insert(notifications)
      .values(dataWithId);

    // Get the inserted notification
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, dataWithId.id));
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() } as any)
      .where(eq(notifications.id, id));

    // Get the updated notification
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getUnreadNotificationsCount(userId: string | null): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        userId ? eq(notifications.userId, userId) : isNull(notifications.userId),
        eq(notifications.isRead, false)
      ));

    return result[0]?.count || 0;
  }

  // ==================== ORDER OPERATIONS ====================
}

export const storage = new DatabaseStorage();