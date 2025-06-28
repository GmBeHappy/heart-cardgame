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
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Forwarded-For",
        "X-Real-IP",
        "X-Forwarded-Proto",
      ],
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6,
    // Handle proxy scenarios
    allowRequest: (req, callback) => {
      // Allow all requests for now, you can add authentication here
      callback(null, true);
    },
  });
}

export const PORT = process.env.PORT || 3001;
