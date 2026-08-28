import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool;

const connectDB = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
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

