import Notification from "../models/mongo/notificationModel.js";
import { io } from "../server.js";

/**
 * Create a notification and emit it via Socket.IO
 * @param {Object} params - Notification parameters
 * @param {String} params.recipientId - User ID to receive the notification
 * @param {String} params.type - Type of notification (course_approved, enrollment, etc.)
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {String} params.entityId - Optional related entity ID
 * @param {Object} params.metadata - Optional metadata
 */
export const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  entityId = null,
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      type,
      title,
      message,
      entityId,
      metadata,
      isRead: false,
    });

    // Emit to user's personal room
    const userRoom = `user_${recipientId}`;
    io.to(userRoom).emit("notification:new", notification);

    console.log(`📢 Notification sent to ${recipientId}:`, notification.type);

    return notification;
  } catch (err) {
    console.error("❌ Error creating notification:", err);
    throw err;
  }
};

/**
 * Emit unread count to a user
 * @param {String} recipientId - User ID
 */
export const emitUnreadCount = async (recipientId) => {
  try {
    const count = await Notification.countDocuments({
      recipientId,
      isRead: false,
    });

    const userRoom = `user_${recipientId}`;
    io.to(userRoom).emit("notification:count", { count });

    return count;
  } catch (err) {
    console.error("❌ Error emitting unread count:", err);
    throw err;
  }
};
