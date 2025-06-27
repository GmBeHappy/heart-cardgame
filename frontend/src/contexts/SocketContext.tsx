"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SocketEvents } from "@/types/game";

interface SocketContextType {
  socket: Socket<SocketEvents> | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<SocketEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    if (socket?.connected) return;

    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

    const newSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      secure: true,
      rejectUnauthorized: false,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected to server after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
