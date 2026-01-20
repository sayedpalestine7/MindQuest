// src/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
});

// Just for debugging
socket.on("connect", () => {
  console.log("🟢 Connected to WebSocket:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 WebSocket disconnected");
});

export default socket;
