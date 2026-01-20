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

  // Initialize socket and fetch notifications when user changes
  useEffect(() => {
    const initializeNotifications = async () => {
      if (user?._id) {
        // Connect socket with auth token
        const token = await tokenStorage.get();
        if (token) {
          connectSocket(token);
        }
        
        await fetchNotifications();
        setupSocketListeners();
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

  const fetchNotifications = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const result = await notificationService.getNotifications();
      if (result.success) {
        setNotifications(result.data);
        updateUnreadCount(result.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!user?._id) return;
    
    const socket = getSocket();
    if (!socket) return;

    // Join user's notification room
    socket.emit('join_notifications', user._id);

    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      console.log('📬 New notification received:', notification);
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show push notification
      notificationService.showLocalNotification(
        notification.title,
        notification.message
      );
    });

    // Listen for notification updates
    socket.on('notification_read', (notificationId) => {
      setNotifications(prev =>
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      updateUnreadCount(notifications);
    });
  };

  const cleanupSocketListeners = () => {
    const socket = getSocket();
    if (!socket) return;
    
    if (user?._id) {
      socket.emit('leave_notifications', user._id);
    }
    socket.off('new_notification');
    socket.off('notification_read');
  };

  const updateUnreadCount = (notificationsList) => {
    const count = notificationsList.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const markAsRead = async (notificationId) => {
    if (!user?._id) return;

    try {
      const result = await notificationService.markAsRead(notificationId);
      
      if (result.success) {
        setNotifications(prev =>
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
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
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
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
        setNotifications(prev => 
          prev.filter(n => n._id !== notificationId)
        );
        updateUnreadCount(notifications.filter(n => n._id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const refresh = () => {
    fetchNotifications();
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
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
