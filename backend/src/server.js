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

// -------------------- CONFIG --------------------
dotenv.config();
connectMongoDB();

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export { stripe }; // Export for use in payment controller

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const app = express();

// CORS Configuration
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'https://accounts.google.com',
  'https://www.googleapis.com'
];

// CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || 
        allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
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
    origin: CLIENT_URL, // must match frontend exactly
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// -------------------- SOCKET CONNECTION --------------------
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

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

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}, CORS allowed for ${CLIENT_URL}`)
);
