import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/useAuth';
import courseService from '../../src/services/courseService';
import chatService from '../../src/services/chatService';
import { getUserAvatar } from '../../src/utils/imageUtils';

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [chatUsers, setChatUsers] = useState([]);
  const [emptyState, setEmptyState] = useState({
    title: 'No Conversations Yet',
    subtitle: 'Enroll in courses to chat with instructors',
    actionLabel: 'Browse Courses',
    actionRoute: '/(tabs)/courses',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    if (user) {
      loadTeachers();
    }
  }, [user]);

  const loadTeachers = async () => {
    try {
      setLoading(true);

      if (isTeacher) {
        const chats = await chatService.getStudentChats(user._id);
        if (Array.isArray(chats) && chats.length > 0) {
          const mapped = chats.map((chat) => ({
            _id: chat._id,
            name: chat.student?.name || 'Student',
            avatar: chat.student?.profileImage || chat.student?.avatar || null,
            subtitle: chat.lastMessage || 'No messages yet',
          }));
          setChatUsers(mapped);
          setEmptyState({
            title: 'No Conversations Yet',
            subtitle: 'Students will appear here once they message you',
            actionLabel: null,
            actionRoute: null,
          });
          return;
        }

        const students = await chatService.getTeacherEnrolledStudents();
        const mappedStudents = Array.isArray(students)
          ? students.map((student) => ({
              _id: student._id,
              name: student.name || 'Student',
              avatar: student.avatar || null,
              subtitle: student.subject || 'Student',
            }))
          : [];
        setChatUsers(mappedStudents);
        setEmptyState({
          title: 'No Messages Yet',
          subtitle: 'You can start a conversation with your enrolled students',
          actionLabel: null,
          actionRoute: null,
        });
        return;
      }

      // Student: Get enrolled courses to extract unique teachers - force fresh data
      const enrolledCourses = await courseService.getEnrolledCourses(user._id, false);

      // Extract unique teachers
      const uniqueTeachers = [];
      const teacherIds = new Set();

      if (Array.isArray(enrolledCourses)) {
        enrolledCourses.forEach((course) => {
          if (course.teacherId && !teacherIds.has(course.teacherId._id)) {
            teacherIds.add(course.teacherId._id);
            uniqueTeachers.push({
              _id: course.teacherId._id,
              name: course.teacherId.name,
              avatar: course.teacherId.profileImage || course.teacherId.avatar || null,
              subtitle: course.title,
            });
          }
        });
      }

      setChatUsers(uniqueTeachers);
      setEmptyState({
        title: 'No Conversations Yet',
        subtitle: 'Enroll in courses to chat with instructors',
        actionLabel: 'Browse Courses',
        actionRoute: '/(tabs)/courses',
      });
    } catch (error) {
      // Silently handle 401 errors (expired token) - interceptor will handle logout
      if (error.response?.status !== 401) {
        console.error('Error loading teachers:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeachers();
    setRefreshing(false);
  };

  const renderTeacherCard = ({ item }) => (
    <TouchableOpacity
      style={styles.teacherCard}
      onPress={() => router.push(`/chat/${item._id}`)}
    >
      <Image
        source={{ uri: getUserAvatar(item) }}
        style={styles.teacherAvatar}
      />
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.courseName} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (chatUsers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyText}>{emptyState.title}</Text>
        <Text style={styles.emptySubtext}>{emptyState.subtitle}</Text>
        {emptyState.actionLabel && emptyState.actionRoute ? (
          <TouchableOpacity
            style={styles.browseCoursesButton}
            onPress={() => router.push(emptyState.actionRoute)}
          >
            <Text style={styles.browseCoursesButtonText}>{emptyState.actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chatUsers}
        renderItem={renderTeacherCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  browseCoursesButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  browseCoursesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  teacherAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: '#6B7280',
  },
});
