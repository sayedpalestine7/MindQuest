import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectMongoDB } from "./db/mongoConnect.js";

import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import fieldRoutes from "./routes/fieldRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

dotenv.config();
connectMongoDB();

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 Base Route
app.get("/", (req, res) => res.send("MindQuest API is running..."));

// 🔗 Connect routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
