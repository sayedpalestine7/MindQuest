import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { connectMongoDB } from "./db/mongoConnect.js";
import cors from 'cors';
import Stripe from 'stripe';

// Models
import Message from "./models/mongo/message.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import fieldRoutes from "./routes/fieldRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import animationRoutes from "./routes/animationRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// -------------------- CONFIG --------------------
dotenv.config();
connectMongoDB();

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export { stripe }; // Export for use in payment controller

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const app = express();

// CORS Configuration
const ENV_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:8081", // Expo web dev server
  "https://accounts.google.com",
  "https://www.googleapis.com",
  ...ENV_ALLOWED_ORIGINS,
];

const isPrivateOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname.startsWith("192.168.")) return true;
    if (hostname.startsWith("10.")) return true;

    const match = hostname.match(/^172\.(\d{1,2})\./);
    if (match) {
      const octet = Number(match[1]);
      return octet >= 16 && octet <= 31;
    }

    return false;
  } catch {
    return false;
  }
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (
    allowedOrigins.includes(origin) ||
    allowedOrigins.some((allowed) => origin.startsWith(allowed))
  ) {
    return true;
  }

  if (process.env.NODE_ENV !== "production" && isPrivateOrigin(origin)) {
    return true;
  }

  return false;
};

// CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    const msg = "The CORS policy for this site does not allow access from the specified Origin.";
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DEBUG: Log all PUT requests
app.use((req, res, next) => {
  if (req.method === 'PUT') {
    console.log(`🔴 PUT REQUEST: ${req.method} ${req.path}`, { params: req.params, body: req.body });
  }
  next();
});

// -------------------- SOCKET.IO SERVER --------------------
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Socket.IO CORS blocked"), false);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// -------------------- SOCKET CONNECTION --------------------
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // -------------------- JOIN USER ROOM --------------------
  // When a user connects, they join their personal room for notifications
  socket.on("join_user_room", (userId) => {
    if (!userId) {
      console.log("⚠️ Missing userId in join_user_room event");
      return;
    }
    
    const userRoom = `user_${userId}`;
    socket.join(userRoom);
    console.log(`🔔 ${socket.id} joined user room: ${userRoom}`);
  });

  // -------------------- JOIN ROOM --------------------
  socket.on("join_room", ({ teacherId, studentId }) => {
    if (!teacherId || !studentId) {
      console.log("⚠️ Missing IDs in join_room event");
      return;
    }

    const roomId = `${teacherId}_${studentId}`;
    socket.join(roomId);
    console.log(`📌 ${socket.id} joined room: ${roomId}`);
  });

  // -------------------- SEND MESSAGE --------------------
  socket.on("send_message", async (data) => {
    const { content, sender, teacherId, studentId } = data;

    if (!content || !sender || !teacherId || !studentId) {
      console.log("⚠️ Invalid message payload:", data);
      socket.emit("error_message", { error: "Invalid message payload" });
      return;
    }

    const roomId = `${teacherId}_${studentId}`;

    try {
      // Save message in MongoDB
      const newMessage = await Message.create({
        content,
        sender,
        teacher: teacherId,
        student: studentId,
        read: false,
      });

      console.log("💬 Message saved:", newMessage._id);

      // Emit message to the room
      io.to(roomId).emit("new_message", {
        ...newMessage.toObject(),
        teacherId,
        studentId
      });
    } catch (err) {
      console.error("❌ Error saving message:", err);
      socket.emit("error_message", { error: "Message save failed" });
    }
  });

  // -------------------- DISCONNECT --------------------
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// -------------------- API ROUTES --------------------
app.get("/", (req, res) => res.send("MindQuest API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/animations", animationRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}, CORS allowed for ${CLIENT_URL}`)
);
