import { createHttpServer, createSocketIOServer, PORT } from "./config/server";
import { SocketController } from "./controllers/socketController";

// Create HTTP server and Socket.IO instance
const httpServer = createHttpServer();
const io = createSocketIOServer(httpServer);

// Initialize socket controller
new SocketController(io);

// Start the server
const HOST = process.env.HOST || "0.0.0.0";
httpServer.listen(Number(PORT), HOST, () => {
  console.log(`Hearts Card Game Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || "*"}`);
});

// Add error handling
httpServer.on("error", (error) => {
  console.error("Server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
