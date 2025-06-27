import { createServer, Server as HttpServer } from "http";
import { Server } from "socket.io";

export function createHttpServer(): HttpServer {
  return createServer();
}

export function createSocketIOServer(httpServer: HttpServer): Server {
  // Get CORS origin from environment or use default
  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

  return new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
}

export const PORT = process.env.PORT || 3001;
