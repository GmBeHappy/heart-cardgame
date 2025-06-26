import { createHttpServer, createSocketIOServer, PORT } from "./config/server";
import { SocketController } from "./controllers/socketController";

// Create HTTP server and Socket.IO instance
const httpServer = createHttpServer();
const io = createSocketIOServer(httpServer);

// Initialize socket controller
new SocketController(io);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Hearts Card Game Server running on port ${PORT}`);
});
