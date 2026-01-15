import express from "express";
import {
  sendMessage,
  getConversation,
  getTeacherChats,
  getStudentChats,
  markAsRead,
  getTeacherUnread,
  getStudentUnread,
  getTeacherEnrolledStudents
} from "../controllers/chatController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send message
router.post("/send", sendMessage);

// Conversation between 1 teacher & 1 student
router.get("/conversation/:teacherId/:studentId", getConversation);

// Chat list for teacher/student
router.get("/teacher/:teacherId/chats", getTeacherChats);
router.get("/student/:studentId/chats", getStudentChats);

// Mark messages as read (teacher or student)
router.put("/read/:teacherId/:studentId", markAsRead);

// NEW — unread counts
router.get("/teacher/unread/:teacherId", getTeacherUnread);
router.get("/student/unread/:studentId", getStudentUnread);

// NEW — teacher chat students (only students enrolled in this teacher's courses)
router.get(
  "/teacher/students",
  protect,
  requireRole(["teacher", "admin"]),
  getTeacherEnrolledStudents
);

export default router;
