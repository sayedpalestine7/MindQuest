import express from "express";
import {
  sendMessage,
  getConversation,
  getTeacherChats,
  getStudentChats,
  markAsRead
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/conversation/:teacherId/:studentId", getConversation);

// ✅ Make sure this matches frontend
router.get("/teacher/:teacherId/chats", getTeacherChats); // note /chats at the end
router.get("/student/:studentId/chats", getStudentChats);

router.put("/read/:teacherId/:studentId", markAsRead);

export default router;
