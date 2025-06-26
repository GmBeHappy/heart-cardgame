import { createServer, Server as HttpServer } from "http";
import { Server } from "socket.io";

export function createHttpServer(): HttpServer {
  return createServer();
}

export function createSocketIOServer(httpServer: HttpServer): Server {
  return new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });
}

export const PORT = process.env.PORT || 3001;
