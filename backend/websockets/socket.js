import { Server } from "socket.io";

export function initSocket(server) {
  //Create the WebSocket server on top of your HTTP server
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    //Listens for a custom event called send_message
    socket.on("send_message", (data) => {
      //This is your realtime message pipeline
      //Broadcasts to EVERY connected client instantly
      io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}
