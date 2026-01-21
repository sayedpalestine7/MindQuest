import React from 'react';
import { Tabs } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../src/context/NotificationsContext';
import { useAuth } from '../../src/auth/useAuth';

export default function TabsLayout() {
  const { unreadCount, openNotifications } = useNotifications();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const NotificationButton = () => (
    <TouchableOpacity
      style={styles.notificationButton}
      onPress={openNotifications}
    >
      <Ionicons name="notifications-outline" size={24} color="#1F2937" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerRight: () => <NotificationButton />,
        }}
      >
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          headerTitle: 'Browse Courses',
          tabBarButton: isTeacher ? () => null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerTitle: 'My Conversations',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>

  </>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
