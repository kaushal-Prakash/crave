import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
      waitForConnections:true,
      connectionLimit:10,
    });
    console.log('😁 MySQL DB connected!');
    return connection;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default connectDB;

