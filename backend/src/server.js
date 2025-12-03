import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectMongoDB } from "./db/mongoConnect.js";

// Models
import Message from "./models/mongo/message.js";

// Routes
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

// -------------------- CONFIG --------------------
dotenv.config();
connectMongoDB();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- SOCKET.IO SERVER --------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Make io available globally
global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // -------------------- JOIN ROOM --------------------
  socket.on("join_room", ({ teacherId, studentId }) => {
    if (!teacherId || !studentId) {
      console.log("⚠️ Missing teacherId or studentId in join_room");
      return;
    }

    const roomId = `${teacherId}_${studentId}`;
    socket.join(roomId);

    console.log(`📌 Socket ${socket.id} joined room: ${roomId}`);
  });

  // -------------------- SEND + SAVE MESSAGE --------------------
  socket.on("send_message", async (data) => {
    const { content, sender, teacherId, studentId } = data;

    if (!content || !sender || !teacherId || !studentId) {
      console.log("⚠️ Invalid message payload received:", data);
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

      // Broadcast to room
      io.to(roomId).emit("new_message", newMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  // -------------------- DISCONNECT --------------------
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
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

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
