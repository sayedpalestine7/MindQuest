import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from '../src/auth/authContext';
import { NotificationsProvider, useNotifications } from '../src/context/NotificationsContext';
import NotificationCenter from '../src/components/notifications/NotificationCenter';
import { useAuth } from '../src/auth/useAuth';
import notificationService from '../src/services/notificationService';

const RootNavigator = () => {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading } = useAuth();

  // Setup notification listeners
  useEffect(() => {
    if (user) {
      notificationService.setupNotificationListeners();
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (user && inAuthGroup) {
      router.replace(user.role === 'teacher' ? '/(tabs)/profile' : '/(tabs)/courses');
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <RootNavigator />
        <NotificationsOverlay />
      </NotificationsProvider>
    </AuthProvider>
  );
}

const NotificationsOverlay = () => {
  const { isOpen, closeNotifications } = useNotifications();
  return (
    <NotificationCenter
      visible={isOpen}
      onClose={closeNotifications}
    />
  );
};
