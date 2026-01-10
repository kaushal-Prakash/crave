import express from "express";
import authMiddleware from "../middlewares/auth.js";
import connectDB from "../services/db.js";

const router = express.Router();

/* ----------------------------------------------------
   RECENT MESSAGES (must be BEFORE :group)
---------------------------------------------------- */
router.get("/recent", authMiddleware, async (req, res) => {
  let connection;
  try {
    connection = await connectDB();

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

    res.json({
      success: true,
      vegMessages,
      nonVegMessages,
      userId: req.userId,
      username: req.username,
      fullName: req.fullName,
    });
  } catch (err) {
    console.error("Recent messages error:", err);
    res.status(500).json({ success: false });
  } finally {
    if (connection) await connection.end();
  }
});

/* ----------------------------------------------------
   GROUP STATS
---------------------------------------------------- */
router.get("/stats", authMiddleware, async (req, res) => {
  let connection;
  try {
    connection = await connectDB();

    const [veg] = await connection.execute(
      `SELECT COUNT(*) AS totalMessages,
              COUNT(DISTINCT user_id) AS onlineUsers
       FROM messages
       WHERE group_type = 'veg'`
    );

    const [nonVeg] = await connection.execute(
      `SELECT COUNT(*) AS totalMessages,
              COUNT(DISTINCT user_id) AS onlineUsers
       FROM messages
       WHERE group_type = 'non-veg'`
    );

    res.json({
      success: true,
      stats: {
        veg: veg[0],
        nonVeg: nonVeg[0],
      },
      userId: req.userId,
      username: req.username,
      fullName: req.fullName,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ success: false });
  } finally {
    if (connection) await connection.end();
  }
});

/* ----------------------------------------------------
   GET MESSAGES BY GROUP (PAGINATED)
---------------------------------------------------- */
router.get("/:group", authMiddleware, async (req, res) => {
  let connection;
  try {
    const { group } = req.params;

    let limit = Number.parseInt(req.query.limit) || 50;
    let offset = Number.parseInt(req.query.offset) || 0;

    // Safety clamp
    if (limit < 1 || limit > 100) limit = 50;
    if (offset < 0) offset = 0;

    connection = await connectDB();

    // ❗ LIMIT & OFFSET must be inline (MySQL rule)
    const [messages] = await connection.execute(
      `SELECT m.*, u.fullName, u.username
       FROM messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.group_type = ?
       ORDER BY m.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [group]
    );

    const [[{ total }]] = await connection.execute(
      `SELECT COUNT(*) AS total FROM messages WHERE group_type = ?`,
      [group]
    );

    res.json({
      success: true,
      messages,
      total,
      hasMore: offset + messages.length < total,
      userId: req.userId,
      username: req.username,
      fullName: req.fullName,
    });
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.end();
  }
});

/* ----------------------------------------------------
   SAVE MESSAGE
---------------------------------------------------- */
router.post("/", authMiddleware, async (req, res) => {
  let connection;
  try {
    const { group, message } = req.body;
    const userId = req.userId;
    const username = req.username;

    connection = await connectDB();

    const [result] = await connection.execute(
      `INSERT INTO messages (user_id, username, group_type, message)
       VALUES (?, ?, ?, ?)`,
      [userId, username, group, message]
    );

    const [rows] = await connection.execute(
      `SELECT m.*, u.fullName, u.username
       FROM messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res
      .status(201)
      .json({
        success: true,
        message: rows[0],
        userId: req.userId,
        username: req.username,
        fullName: req.fullName,
      });
  } catch (err) {
    console.error("Save message error:", err);
    res.status(500).json({ success: false });
  } finally {
    if (connection) await connection.end();
  }
});

/* ----------------------------------------------------
   DELETE MESSAGE
---------------------------------------------------- */
router.delete("/:id", authMiddleware, async (req, res) => {
  let connection;
  try {
    const id = Number.parseInt(req.params.id);
    const userId = req.userId;

    connection = await connectDB();

    const [rows] = await connection.execute(
      `SELECT id FROM messages WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Not authorized or message not found",
      });
    }

    await connection.execute(`DELETE FROM messages WHERE id = ?`, [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ success: false });
  } finally {
    if (connection) await connection.end();
  }
});

export default router;
