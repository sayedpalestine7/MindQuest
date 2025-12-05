// frontend/utils/socket.js
import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,

});
export default socket; 