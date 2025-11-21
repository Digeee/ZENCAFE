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

console.log('Connecting to MySQL database:', mysqlConfig.host, mysqlConfig.database);

let connection;
let db;

if (isDevelopment) {
  // In development, try to connect to MySQL, but fall back to mock if it fails
  try {
    connection = await createConnection(mysqlConfig);
    console.log('MySQL connection established successfully');
    db = drizzle(connection, { schema, mode: 'default' });
  } catch (error) {
    console.warn('Failed to connect to MySQL database, using mock database:', error.message);
    
    // Create a mock database object for development
    db = {
      select: () => Promise.resolve([]),
      insert: () => ({ 
        values: () => ({ 
          returning: () => Promise.resolve([]),
          onDuplicateKeyUpdate: () => ({ returning: () => Promise.resolve([]) }),
          execute: () => Promise.resolve()
        })
      }),
      update: () => ({ 
        set: () => ({ 
          where: () => ({ returning: () => Promise.resolve([]) }),
          execute: () => Promise.resolve()
        })
      }),
      delete: () => ({ 
        where: () => ({ returning: () => Promise.resolve([]) }),
        execute: () => Promise.resolve()
      }),
    };
  }
} else {
  // In production, we require a database connection
  try {
    connection = await createConnection(mysqlConfig);
    console.log('MySQL connection established successfully');
    db = drizzle(connection, { schema, mode: 'default' });
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error.message);
    throw error;
  }
}

export { db };