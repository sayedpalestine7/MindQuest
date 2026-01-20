import Notification from "../models/mongo/notificationModel.js";

// -------------------- GET NOTIFICATIONS --------------------
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { limit = 20, skip = 0 } = req.query;

    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 50);
    const parsedSkip = parseInt(skip, 10) || 0;

    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .skip(parsedSkip)
      .limit(parsedLimit)
      .lean();

    const total = await Notification.countDocuments({ recipientId: userId });

    res.status(200).json({
      notifications,
      total,
      hasMore: parsedSkip + notifications.length < total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- GET UNREAD COUNT --------------------
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- MARK AS READ --------------------
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- MARK ALL AS READ --------------------
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- DELETE NOTIFICATION --------------------
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
