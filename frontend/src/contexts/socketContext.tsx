"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinGroup: (group: string, userId: string, username: string) => void;
  leaveGroup: (group: string, username: string) => void;
  sendMessage: (group: string, message: string, userId: string, username: string) => void;
  sendTyping: (group: string, username: string) => void;
  sendStopTyping: (group: string, username: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = () => {
    if (socketRef.current?.connected) return;

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket server:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❗ Socket connect error:", err.message);
    });

    socketRef.current = socket;
  };

  const disconnectSocket = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  };

  const joinGroup = (group: string, userId: string, username: string) => {
    socketRef.current?.emit("join_group", { group, userId, username });
  };

  const leaveGroup = (group: string, username: string) => {
    socketRef.current?.emit("leave_group", { group, username });
  };

  const sendMessage = (group: string, message: string, userId: string, username: string) => {
    socketRef.current?.emit("group_message", { group, message, userId, username });
  };

  const sendTyping = (group: string, username: string) => {
    socketRef.current?.emit("typing", { group, username });
  };

  const sendStopTyping = (group: string, username: string) => {
    socketRef.current?.emit("stop_typing", { group, username });
  };

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        connectSocket,
        disconnectSocket,
        joinGroup,
        leaveGroup,
        sendMessage,
        sendTyping,
        sendStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
