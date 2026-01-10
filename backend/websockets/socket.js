import { Server } from "socket.io";
import mysql from "mysql2/promise";

const createDbConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
};

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", process.env.FRONTEND],
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  const activeUsers = new Map();

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    // Join a group room
    socket.on("join_group", async ({ group, userId, username }) => {
      const roomName = `group_${group}`;
      socket.join(roomName);
      
      activeUsers.set(socket.id, { userId, username, group, roomName });
      
      // Notify others in the room
      socket.to(roomName).emit("user_joined", {
        username,
        timestamp: new Date().toISOString(),
      });

      // Get room users from active users
      const roomUsers = Array.from(activeUsers.values())
        .filter(user => user.roomName === roomName)
        .map(user => ({ username: user.username, userId: user.userId }));

      socket.emit("room_users", roomUsers);

      console.log(`${username} joined ${roomName}`);
    });

    // Send message to a group
    socket.on("group_message", async ({ group, message, userId, username }) => {
      const roomName = `group_${group}`;
      const timestamp = new Date().toISOString();
      
      const messageData = {
        id: `${socket.id}_${Date.now()}`,
        userId,
        username,
        group,
        message,
        timestamp,
      };

      // Save message to MySQL
      try {
        const connection = await createDbConnection();
        await connection.execute(
          'INSERT INTO messages (user_id, username, group_type, message, created_at) VALUES (?, ?, ?, ?, ?)',
          [userId, username, group, message, timestamp]
        );
        await connection.end();
      } catch (error) {
        console.error('Error saving message to database:', error);
      }

      // Emit to everyone in the room
      io.to(roomName).emit("new_message", messageData);
      
      console.log(`Message in ${roomName} from ${username}: ${message}`);
    });

    // ... rest of the socket events remain the same ...
    socket.on("typing", ({ group, username }) => {
      const roomName = `group_${group}`;
      socket.to(roomName).emit("user_typing", { username });
    });

    socket.on("stop_typing", ({ group, username }) => {
      const roomName = `group_${group}`;
      socket.to(roomName).emit("user_stop_typing", { username });
    });

    socket.on("leave_group", ({ group, username }) => {
      const roomName = `group_${group}`;
      socket.leave(roomName);
      activeUsers.delete(socket.id);
      
      socket.to(roomName).emit("user_left", {
        username,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.to(user.roomName).emit("user_left", {
          username: user.username,
          timestamp: new Date().toISOString(),
        });
        activeUsers.delete(socket.id);
      }
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}