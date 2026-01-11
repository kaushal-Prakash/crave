import { Server } from "socket.io";
import db from "../services/db.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: (process.env.FRONTEND || "http://localhost:3000"),
      credentials: true,
    },
  });

  /**
   * Map<roomName, Map<userId, { username, socketId }>>
   */
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("join_group", ({ group, userId, username }) => {
      const roomName = `group_${group}`;
      socket.join(roomName);

      if (!rooms.has(roomName)) {
        rooms.set(roomName, new Map());
      }

      rooms.get(roomName).set(userId, {
        username,
        socketId: socket.id,
      });

      const roomUsers = Array.from(rooms.get(roomName).entries()).map(
        ([uid, user]) => ({
          userId: uid,
          username: user.username,
        })
      );

      io.to(roomName).emit("room_users", roomUsers);

      console.log(`👥 ${username} joined ${roomName}`);
    });

    socket.on("group_message", async ({ group, message, userId, username }) => {
      const roomName = `group_${group}`;
      const timestamp = new Date();

      try {
        await db.execute(
          `INSERT INTO messages (user_id, username, group_type, message, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, username, group, message, timestamp]
        );
      } catch (err) {
        console.error("❌ DB insert failed:", err);
        return;
      }

      io.to(roomName).emit("new_message", {
        userId,
        username,
        group,
        message,
        timestamp,
      });
    });

    socket.on("typing", ({ group, username }) => {
      socket.to(`group_${group}`).emit("user_typing", { username });
    });

    socket.on("stop_typing", ({ group, username }) => {
      socket.to(`group_${group}`).emit("user_stop_typing", { username });
    });

    socket.on("disconnect", () => {
      for (const [roomName, users] of rooms.entries()) {
        for (const [userId, user] of users.entries()) {
          if (user.socketId === socket.id) {
            users.delete(userId);

            io.to(roomName).emit("room_users",
              Array.from(users.entries()).map(([uid, u]) => ({
                userId: uid,
                username: u.username,
              }))
            );

            console.log(`❌ ${user.username} left ${roomName}`);
            break;
          }
        }
      }
    });
  });

  return io;
}
