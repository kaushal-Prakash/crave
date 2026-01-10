import { Server } from "socket.io";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", process.env.FRONTEND],
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  // Store active users and their rooms
  const activeUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a group room (veg or non-veg)
    socket.on("join_group", ({ group, userId, username }) => {
      const roomName = `group_${group}`;
      socket.join(roomName);
      
      // Store user info
      activeUsers.set(socket.id, { userId, username, group, roomName });
      
      // Notify others in the room
      socket.to(roomName).emit("user_joined", {
        username,
        timestamp: new Date().toISOString(),
      });

      // Send current users in room to the new user
      const roomUsers = Array.from(activeUsers.values())
        .filter(user => user.roomName === roomName)
        .map(user => ({ username: user.username, userId: user.userId }));

      socket.emit("room_users", roomUsers);

      console.log(`${username} joined ${roomName}`);
    });

    // Send message to a group
    socket.on("group_message", ({ group, message, userId, username }) => {
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

      // Emit to everyone in the room including sender
      io.to(roomName).emit("new_message", messageData);
      
      console.log(`Message in ${roomName} from ${username}: ${message}`);
    });

    // Typing indicator
    socket.on("typing", ({ group, username }) => {
      const roomName = `group_${group}`;
      socket.to(roomName).emit("user_typing", { username });
    });

    // Stop typing indicator
    socket.on("stop_typing", ({ group, username }) => {
      const roomName = `group_${group}`;
      socket.to(roomName).emit("user_stop_typing", { username });
    });

    // Leave group
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