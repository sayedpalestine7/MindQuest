import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { connectSocket, disconnectSocket, getSocket } from '../../src/sockets/socket';
import { getConversation } from '../../src/api/chat';

export default function ChatScreen() {
  const { user, token } = useAuth();
  const [partnerId, setPartnerId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  const role = user?.role || 'student';

  const teacherId = useMemo(() => (role === 'teacher' ? user?._id : partnerId), [role, user, partnerId]);
  const studentId = useMemo(() => (role === 'student' ? user?._id : partnerId), [role, user, partnerId]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const connectToChat = async () => {
    setError('');

    if (!teacherId || !studentId) {
      setError('Provide both teacher and student IDs.');
      return;
    }

    try {
      const history = await getConversation({ teacherId, studentId });
      setMessages(history || []);

      const socket = connectSocket(token);
      socket.emit('join_room', { teacherId, studentId });

      socket.off('new_message');
      socket.on('new_message', (payload) => {
        setMessages((prev) => [...prev, payload]);
      });

      setConnected(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to connect to chat.');
    }
  };

  const handleSend = () => {
    setError('');
    if (!message.trim()) return;
    if (!teacherId || !studentId) {
      setError('Provide both teacher and student IDs.');
      return;
    }

    const payload = {
      content: message.trim(),
      sender: role,
      teacherId,
      studentId,
    };

    const socket = getSocket();
    socket?.emit('send_message', payload);
    setMessages((prev) => [...prev, { ...payload, _id: Date.now().toString() }]);
    setMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>Role: {role}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder={role === 'student' ? 'Teacher ID' : 'Student ID'}
        value={partnerId}
        onChangeText={setPartnerId}
      />

      <Pressable style={styles.connectButton} onPress={connectToChat}>
        <Text style={styles.connectText}>{connected ? 'Reconnect' : 'Connect'}</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={messages}
        keyExtractor={(item) => item._id || `${item.content}-${Math.random()}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === role ? styles.outgoing : styles.incoming]}>
            <Text style={item.sender === role ? styles.messageTextOutgoing : styles.messageTextIncoming}>
              {item.content}
            </Text>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          placeholder="Type your message"
          value={message}
          onChangeText={setMessage}
        />
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  connectButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  connectText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    marginBottom: 8,
  },
  list: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '80%',
  },
  outgoing: {
    alignSelf: 'flex-end',
    backgroundColor: '#111827',
  },
  incoming: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
  },
  messageTextIncoming: {
    color: '#111827',
  },
  messageTextOutgoing: {
    color: '#fff',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
