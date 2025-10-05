import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma/client.js";
import { connectMongoDB } from "./db/mongoConnect.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect databases
connectMongoDB();
prisma.$connect()
    .then(() => console.log("✅ PostgreSQL connected via Prisma"))
    .catch(err => console.error("❌ Prisma connection error:", err));

// Test route
app.get("/", (req, res) => {
    res.send("MindQuest backend running successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
