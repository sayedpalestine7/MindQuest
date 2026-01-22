import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import notificationService from '../services/notificationService';
import { getSocket, connectSocket, disconnectSocket } from '../sockets/socket';
import { tokenStorage } from '../api/client';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const normalizeNotification = (notification) => ({
    ...notification,
    read: notification.read ?? notification.isRead ?? false,
  });

  // Initialize socket and fetch notifications when user changes
  useEffect(() => {
    const initializeNotifications = async () => {
      if (user?._id) {
        // Connect socket with auth token
        const token = await tokenStorage.get();
        if (token) {
          connectSocket(token);
          await fetchNotifications();
          setupSocketListeners();
        }
      } else {
        // Disconnect socket when user logs out
        disconnectSocket();
      }
    };

    initializeNotifications();

    return () => {
      cleanupSocketListeners();
    };
  }, [user?._id]);

  const fetchNotifications = async ({ log = false } = {}) => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const result = await notificationService.getNotifications({ log });
      if (result.success) {
        const raw = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.notifications)
            ? result.data.notifications
            : [];
        const normalized = raw.map(normalizeNotification);
        setNotifications(normalized);
        updateUnreadCount(normalized);
        if (log) {
          console.log('Notifications stored count:', normalized.length);
        }
      }
    } catch (error) {
      // Silently handle 401 errors (expired token) - interceptor will handle logout
      if (error.response?.status !== 401) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!user?._id) return;
    
    const socket = getSocket();
    if (!socket) return;

    // Join user's notification room
    socket.emit('join_user_room', user._id);

    // Listen for new notifications
    socket.on('notification:new', (notification) => {
      console.log('📬 New notification received:', notification);
      const normalized = normalizeNotification(notification);
      setNotifications(prev => {
        const updated = [normalized, ...prev];
        updateUnreadCount(updated);
        return updated;
      });
      
      // Show push notification
      notificationService.showLocalNotification(
        notification.title,
        notification.message
      );
    });

    // Listen for notification updates
    socket.on('notification:count', ({ count }) => {
      setUnreadCount(count);
      if (count > 0 && notifications.length === 0) {
        fetchNotifications();
      }
    });
  };

  const cleanupSocketListeners = () => {
    const socket = getSocket();
    if (!socket) return;
    
    socket.off('notification:new');
    socket.off('notification:count');
  };

  const updateUnreadCount = (notificationsList) => {
    const count = notificationsList.filter(n => !(n.read ?? n.isRead)).length;
    setUnreadCount(count);
  };

  const markAsRead = async (notificationId) => {
    if (!user?._id) return;

    try {
      const result = await notificationService.markAsRead(notificationId);
      
      if (result.success) {
        setNotifications(prev => {
          const updated = prev.map(n =>
            n._id === notificationId ? { ...n, read: true, isRead: true } : n
          );
          updateUnreadCount(updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?._id) return;

    try {
      const result = await notificationService.markAllAsRead();
      
      if (result.success) {
        setNotifications(prev => {
          const updated = prev.map(n => ({ ...n, read: true, isRead: true }));
          setUnreadCount(0);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!user?._id) return;

    try {
      const result = await notificationService.deleteNotification(notificationId);
      
      if (result.success) {
        setNotifications(prev => {
          const updated = prev.filter(n => n._id !== notificationId);
          updateUnreadCount(updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const refresh = () => {
    fetchNotifications();
  };

  const openNotifications = () => {
    setIsOpen(true);
    fetchNotifications({ log: true });
  };

  const closeNotifications = () => {
    setIsOpen(false);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    isOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    openNotifications,
    closeNotifications
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
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

export default NotificationsContext;
