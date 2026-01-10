import express from "express";
import mysql from "mysql2/promise";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// Create database connection
const createDbConnection = async () => {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
};

// Get messages for a specific group
router.get("/:group", authMiddleware, async (req, res) => {
  let connection;
  try {
    const { group } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    connection = await createDbConnection();
    
    const [messages] = await connection.execute(
      `SELECT m.*, u.fullName, u.username 
       FROM messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.group_type = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [group, limit, offset]
    );

    // Also get total count for pagination
    const [[{ total }]] = await connection.execute(
      `SELECT COUNT(*) as total FROM messages WHERE group_type = ?`,
      [group]
    );

    res.status(200).json({ 
      success: true, 
      messages,
      total,
      hasMore: offset + messages.length < total
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Get recent messages for both groups (for homepage preview)
router.get("/", authMiddleware, async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    
    // Get recent messages from both groups
    const [vegMessages] = await connection.execute(
      `SELECT m.*, u.fullName, u.username 
       FROM messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.group_type = 'veg'
       ORDER BY m.created_at DESC
       LIMIT 5`
    );

    const [nonVegMessages] = await connection.execute(
      `SELECT m.*, u.fullName, u.username 
       FROM messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.group_type = 'non-veg'
       ORDER BY m.created_at DESC
       LIMIT 5`
    );

    res.status(200).json({ 
      success: true, 
      vegMessages,
      nonVegMessages
    });
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Save a message (if needed for direct API calls)
router.post("/", authMiddleware, async (req, res) => {
  let connection;
  try {
    const { group, message } = req.body;
    const userId = req.userId;
    const username = req.username;

    connection = await createDbConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO messages (user_id, username, group_type, message) VALUES (?, ?, ?, ?)',
      [userId, username, group, message]
    );

    // Get the inserted message with user details
    const [[savedMessage]] = await connection.execute(
      `SELECT m.*, u.fullName, u.username 
       FROM messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: savedMessage });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Delete a message (owner only)
router.delete("/:id", authMiddleware, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const userId = req.userId;

    connection = await createDbConnection();
    
    // Check if message exists and user is owner
    const [[message]] = await connection.execute(
      'SELECT * FROM messages WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        error: 'Message not found or you are not the owner' 
      });
    }

    await connection.execute(
      'DELETE FROM messages WHERE id = ?',
      [id]
    );

    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

export default router;