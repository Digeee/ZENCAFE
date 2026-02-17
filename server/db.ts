// MySQL database connection
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

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


let connection;

try {
  connection = await createConnection(mysqlConfig);
  console.log('MySQL connection established successfully');
} catch (error: any) {
  console.error('Failed to connect to MySQL database:', error.message);
  // In development, we might want to continue execution even if DB fails, 
  // but strictly speaking, the application cannot function without DB.
  // The original code had a mock, but it was returning empty arrays which causes logic errors.
  // We will exit if strict mode is implied, or try to reconnect?
  // For now, we'll throw to prevent undefined behavior downstream.
  if (!isDevelopment) throw error;

  console.warn('DEV MODE: Continuing with mock/empty database (functionality will be limited)');
  // Provide a minimal mock to prevent immediate crashes, but warn heavily.
  connection = {
    // Minimal mock connection object if needed by drizzle-orm/mysql2
    query: async () => [[]],
    execute: async () => [[]],
    end: async () => { },
  } as any;
}

export const db = drizzle(connection, { schema, mode: 'default' });