// MySQL database connection
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zencafe',
};

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '****' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('Connecting to MySQL database with config:', mysqlConfig);

let db: any;

async function initializeDatabase() {
  let connection: any;
  
  if (isDevelopment) {
    // In development, try to connect to MySQL, but fall back to mock if it fails
    try {
      connection = await createConnection(mysqlConfig);
      console.log('MySQL connection established successfully');
      db = drizzle(connection, { schema, mode: 'default' });
    } catch (error: any) {
      console.warn('Failed to connect to MySQL database, using mock database:', error.message);
      
      // Create a more complete mock database object for development
      db = {
        select: () => ({
          from: (table: any) => ({
            where: (condition: any) => Promise.resolve([]),
            orderBy: (...args: any[]) => Promise.resolve([]),
            execute: () => Promise.resolve([])
          }),
          execute: () => Promise.resolve([])
        }),
        insert: (table: any) => ({ 
          values: (data: any) => ({ 
            returning: () => Promise.resolve([]),
            onDuplicateKeyUpdate: (updateData: any) => ({ returning: () => Promise.resolve([]) }),
            execute: () => Promise.resolve()
          })
        }),
        update: (table: any) => ({ 
          set: (data: any) => ({ 
            where: (condition: any) => ({ returning: () => Promise.resolve([]) }),
            execute: () => Promise.resolve()
          })
        }),
        delete: (table: any) => ({ 
          where: (condition: any) => ({ returning: () => Promise.resolve([]) }),
          execute: () => Promise.resolve()
        }),
        transaction: async (fn: any) => {
          return await fn(db);
        }
      };
    }
  } else {
    // In production, we require a database connection
    try {
      connection = await createConnection(mysqlConfig);
      console.log('MySQL connection established successfully');
      db = drizzle(connection, { schema, mode: 'default' });
    } catch (error: any) {
      console.error('Failed to connect to MySQL database:', error.message);
      throw error;
    }
  }
  
  return db;
}

// Initialize the database connection
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});

export { db };