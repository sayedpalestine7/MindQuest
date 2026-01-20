import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { notificationService } from "../services/notificationService";
import socket from "../socket";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?._id || user?.id;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!isAuthenticated || !userId) return;
    
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(20, 0);
      if (response.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, userId]);

  // Socket listeners
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    // Join user's personal room for notifications
    socket.emit("join_user_room", userId);

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      console.log("🔔 New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Listen for notification count updates
    const handleNotificationCount = ({ count }) => {
      setUnreadCount(count);
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:count", handleNotificationCount);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:count", handleNotificationCount);
    };
  }, [isAuthenticated, userId]);

  const markAllRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const markRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAllRead,
    markRead,
    refreshNotifications: fetchNotifications,
    refreshUnreadCount: fetchUnreadCount,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};

export default NotificationsContext;
