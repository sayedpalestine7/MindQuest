import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get notifications for logged-in user
router.get("/", protect, getNotifications);

// Get unread count
router.get("/unread", protect, getUnreadCount);

// Mark single notification as read
router.put("/:notificationId/read", protect, markAsRead);

// Mark all notifications as read
router.put("/read-all", protect, markAllAsRead);

export default router;
