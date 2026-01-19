import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext();

const getStorageKey = (userId) => `adminNotifications:${userId || "guest"}`;

const normalizeNotifications = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .filter((n) => n && (n.id || n._id))
    .map((n) => ({
      id: n.id || n._id,
      title: n.title || "Notification",
      message: n.message || "",
      createdAt: n.createdAt || new Date().toISOString(),
      read: Boolean(n.read),
    }));
};

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || user?.id || localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        setNotifications(normalizeNotifications(JSON.parse(raw)));
        return;
      } catch (err) {
        console.error("Failed to parse notifications:", err);
      }
    }
    setNotifications([]);
  }, [userId]);

  useEffect(() => {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(notifications));
  }, [notifications, userId]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const addNotification = (notification) => {
    const normalized = normalizeNotifications([notification]);
    if (!normalized.length) return;
    setNotifications((prev) => [
      ...normalized.map((n) => ({ ...n, read: false })),
      ...prev,
    ]);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    markRead,
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
