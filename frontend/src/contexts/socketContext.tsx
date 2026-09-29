"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
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
  const [shouldConnect, setShouldConnect] = useState(false);

  useEffect(() => {
    // Auto-connect when component mounts
    setShouldConnect(true);
  }, []);

  useEffect(() => {
    if (!shouldConnect) return;

    console.log("🔌 Initializing socket connection...");
    
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!.replace(/\/$/, ""), {
      withCredentials: true,
      transports: ["websocket", "polling"], // Add polling as fallback
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected, ID:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❗ Socket connect error:", err.message);
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [shouldConnect]);

  const joinGroup = (group: string, userId: string, username: string) => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Socket not connected, cannot join group");
      return;
    }
    
    console.log(`👤 ${username} (${userId}) joining group: ${group}`);
    socketRef.current?.emit("join_group", { 
      group, 
      userId, 
      username,
      socketId: socketRef.current.id 
    });
  };

  const leaveGroup = (group: string, username: string) => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Socket not connected, cannot leave group");
      return;
    }
    
    console.log(`👤 ${username} leaving group: ${group}`);
    socketRef.current?.emit("leave_group", { group, username });
  };

  const sendMessage = (group: string, message: string, userId: string, username: string) => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Socket not connected, cannot send message");
      return;
    }
    
    console.log(`📨 ${username} sending to ${group}: ${message.substring(0, 30)}...`);
    socketRef.current?.emit("group_message", { 
      group, 
      message, 
      userId, 
      username,
      timestamp: new Date().toISOString()
    });
  };

  const sendTyping = (group: string, username: string) => {
    if (!socketRef.current?.connected) {
      return;
    }
    
    socketRef.current?.emit("typing", { group, username });
  };

  const sendStopTyping = (group: string, username: string) => {
    if (!socketRef.current?.connected) {
      return;
    }
    
    socketRef.current?.emit("stop_typing", { group, username });
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
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