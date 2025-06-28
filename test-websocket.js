const { io } = require("socket.io-client");

console.log("Testing WebSocket connection...");

const socket = io("https://heart-api.game.witchayut.com", {
  transports: ["websocket", "polling"],
  timeout: 10000,
  forceNew: true,
});

socket.on("connect", () => {
  console.log("✅ Successfully connected to WebSocket server!");
  console.log("Socket ID:", socket.id);
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
  console.error("Error details:", error);
  process.exit(1);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error("❌ Connection timeout after 10 seconds");
  socket.disconnect();
  process.exit(1);
}, 10000);
