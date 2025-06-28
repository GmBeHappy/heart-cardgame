import {
  createServer,
  Server as HttpServer,
  IncomingMessage,
  ServerResponse,
} from "http";
import { Server } from "socket.io";

export function createHttpServer(): HttpServer {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // Health check endpoint
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        })
      );
      return;
    }

    // Default response for other routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  return server;
}

export function createSocketIOServer(httpServer: HttpServer): Server {
  return new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
}

export const PORT = process.env.PORT || 3001;
