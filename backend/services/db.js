import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

let pool;

const connectDB = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        waitForConnections: true,
        connectionLimit: 10,
      });
    }
    console.log('😁 MySQL DB connected!');
    return pool;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default connectDB;

