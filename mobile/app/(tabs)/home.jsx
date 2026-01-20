import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../../src/auth/useAuth';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MindQuest Mobile</Text>
      <Text style={styles.subtitle}>Welcome{user?.name ? `, ${user.name}` : ''}!</Text>
      <Text style={styles.meta}>Role: {user?.role || 'unknown'}</Text>

      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
