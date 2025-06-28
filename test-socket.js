const { io } = require("socket.io-client");

// Connect to your Socket.IO server
const socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("✅ Successfully connected to Socket.IO server!");
  console.log("Socket ID:", socket.id);

  // Test a simple emit
  socket.emit("test", { message: "Hello from Mac!" });
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from Socket.IO server");
});

socket.on("connect_error", (error) => {
  console.log("❌ Connection error:", error.message);
});

// Listen for any test response
socket.on("test_response", (data) => {
  console.log("📨 Received test response:", data);
});

// Disconnect after 5 seconds
setTimeout(() => {
  console.log("🔄 Disconnecting...");
  socket.disconnect();
  process.exit(0);
}, 5000);
