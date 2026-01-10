"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectSocket: () => {},
  disconnectSocket: () => {},
  joinGroup: () => {},
  leaveGroup: () => {},
  sendMessage: () => {},
  sendTyping: () => {},
  sendStopTyping: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = () => {
    if (socket && isConnected) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false, // Don't auto-connect
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Connect manually
    socketInstance.connect();
    setSocket(socketInstance);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const joinGroup = (group: string, userId: string, username: string) => {
    if (socket && isConnected) {
      socket.emit("join_group", { group, userId, username });
    }
  };

  const leaveGroup = (group: string, username: string) => {
    if (socket && isConnected) {
      socket.emit("leave_group", { group, username });
    }
  };

  const sendMessage = (group: string, message: string, userId: string, username: string) => {
    if (socket && isConnected) {
      socket.emit("group_message", { group, message, userId, username });
    }
  };

  const sendTyping = (group: string, username: string) => {
    if (socket && isConnected) {
      socket.emit("typing", { group, username });
    }
  };

  const sendStopTyping = (group: string, username: string) => {
    if (socket && isConnected) {
      socket.emit("stop_typing", { group, username });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
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