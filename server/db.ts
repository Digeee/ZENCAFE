// MySQL database connection
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

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
try {
  connection = await createConnection(mysqlConfig);
  console.log('MySQL connection established successfully');
} catch (error) {
  console.error('Failed to connect to MySQL database:', error.message);
  throw error;
}

export const db = drizzle(connection, { schema, mode: 'default' });