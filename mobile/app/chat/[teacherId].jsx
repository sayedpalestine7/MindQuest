import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/useAuth';
import chatService from '../../src/services/chatService';
import teacherService from '../../src/services/teacherService';
import studentService from '../../src/services/studentService';
import { connectSocket, disconnectSocket } from '../../src/sockets/socket';
import { getUserAvatar } from '../../src/utils/imageUtils';

export default function ChatScreen() {
  const { teacherId: partnerId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [oldestCursor, setOldestCursor] = useState(null);
  const isTeacher = user?.role === 'teacher';
  const teacherId = isTeacher ? user?._id : partnerId;
  const studentId = isTeacher ? partnerId : user?._id;
  const senderRole = isTeacher ? 'teacher' : 'student';

  useEffect(() => {
    if (user && teacherId && studentId) {
      loadMessages();
      loadChatPartner();
      setupSocketListeners();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, teacherId, studentId]);

  const loadChatPartner = async () => {
    try {
      if (isTeacher) {
        const student = await studentService.getStudentById(studentId);
        setChatPartner(student);
      } else {
        const teacher = await teacherService.getTeacherById(teacherId);
        setChatPartner(teacher);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error loading chat partner:', error);
      }
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversation(teacherId, studentId, 50);
      // Reverse messages so oldest are at top, newest at bottom
      setMessages((data.messages || []).reverse());
      setHasMore(data.hasMore || false);
      setOldestCursor(data.oldestCursor || null);
      await chatService.markAsRead(teacherId, studentId, senderRole);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || !oldestCursor) return;

    try {
      setLoadingMore(true);
      const data = await chatService.getConversation(teacherId, studentId, 50, oldestCursor);
      
      // Prepend older messages to the beginning
      const olderMessages = (data.messages || []).reverse();
      setMessages((prev) => [...olderMessages, ...prev]);
      setHasMore(data.hasMore || false);
      setOldestCursor(data.oldestCursor || null);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const setupSocketListeners = () => {
    const socket = connectSocket(user.token);

    socket.on('newMessage', (message) => {
      if (
        (message.teacher?.toString() === teacherId && message.student?.toString() === studentId) ||
        (message.student?.toString() === studentId && message.teacher?.toString() === teacherId)
      ) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);
      const message = await chatService.sendMessage(teacherId, studentId, messageText.trim(), senderRole);
      
      // Optimistically add to UI
      setMessages((prev) => [...prev, message]);
      setMessageText('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender === senderRole;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isOwnMessage && (
          <Image
            source={{ uri: getUserAvatar(chatPartner) }}
            style={styles.avatar}
          />
        )}
        <View style={[styles.messageBubble, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
          <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: chatPartner?.name || 'Chat',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation with your instructor</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item._id || index.toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={scrollToBottom}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            inverted={false}
            ListHeaderComponent={
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#6366f1" />
                  <Text style={styles.loadingMoreText}>Loading older messages...</Text>
                </View>
              ) : hasMore ? (
                <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreMessages}>
                  <Ionicons name="arrow-up-circle-outline" size={20} color="#6366f1" />
                  <Text style={styles.loadMoreText}>Load older messages</Text>
                </TouchableOpacity>
              ) : messages.length > 20 ? (
                <View style={styles.endOfMessagesContainer}>
                  <Text style={styles.endOfMessagesText}>Start of conversation</Text>
                </View>
              ) : null
            }
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending || !messageText.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  ownMessage: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#E0E7FF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: '#64748b',
  },
  loadMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  endOfMessagesContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  endOfMessagesText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
