import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationsContext';
import { useRouter } from 'expo-router';

const NotificationItem = ({ notification, onPress, onDelete }) => {
  const getIcon = (type) => {
    const icons = {
      enrollment: 'school',
      course_approved: 'checkmark-circle',
      course_rejected: 'close-circle',
      lesson_complete: 'book',
      quiz_complete: 'trophy',
      message: 'chatbubble',
      achievement: 'star',
      default: 'notifications'
    };
    return icons[type] || icons.default;
  };

  const getIconColor = (type) => {
    const colors = {
      enrollment: '#6366f1',
      course_approved: '#10b981',
      course_rejected: '#ef4444',
      lesson_complete: '#3b82f6',
      quiz_complete: '#f59e0b',
      message: '#8b5cf6',
      achievement: '#eab308',
      default: '#64748b'
    };
    return colors[type] || colors.default;
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const isRead = notification.read ?? notification.isRead ?? false;

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !isRead && styles.notificationItemUnread]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(notification.type)}20` }]}>
        <Ionicons name={getIcon(notification.type)} size={24} color={getIconColor(notification.type)} />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          {!isRead && <View style={styles.unreadDot} />}
        </View>
        
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        
        <Text style={styles.notificationTime}>
          {formatTime(notification.createdAt)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(notification._id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle" size={20} color="#94a3b8" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function NotificationCenter({ visible, onClose }) {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refresh
  } = useNotifications();

  useEffect(() => {
    if (visible) {
      console.log('NotificationCenter count:', notifications.length);
    }
  }, [visible, notifications.length]);

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.entityId) {
      const { type, entityId } = notification;
      
      switch (type) {
        case 'enrollment':
        case 'course_approved':
          router.push(`/course/${entityId}`);
          break;
        case 'lesson_complete':
          router.push(`/lesson/${entityId}`);
          break;
        case 'message':
          router.push(`/chat/${entityId}`);
          break;
        default:
          // Do nothing
          break;
      }
      
      onClose();
    }
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="notifications" size={24} color="#6366f1" />
              <Text style={styles.headerTitle}>Notifications</Text>
              {__DEV__ && (
                <Text style={styles.debugCount}>Loaded: {notifications.length}</Text>
              )}
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          {notifications.length > 0 && unreadCount > 0 && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={handleMarkAllRead}
              >
                <Ionicons name="checkmark-done" size={18} color="#6366f1" />
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications List */}
          <ScrollView
            style={styles.notificationsList}
            contentContainerStyle={notifications.length === 0 ? styles.emptyContent : styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                colors={['#6366f1']}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off" size={64} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptyDescription}>
                  You're all caught up! Check back later for updates.
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onPress={handleNotificationPress}
                  onDelete={handleDelete}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: 260,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  debugCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actions: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  notificationsList: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  notificationItemUnread: {
    backgroundColor: '#f8fafc',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
