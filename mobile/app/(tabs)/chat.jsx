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
import { getUserAvatar } from '../../src/utils/imageUtils';

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadTeachers();
    }
  }, [user]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      
      // Get enrolled courses to extract unique teachers - force fresh data
      const enrolledCourses = await courseService.getEnrolledCourses(user._id, false);
      
      // Extract unique teachers
      const uniqueTeachers = [];
      const teacherIds = new Set();
      
      // Check if enrolledCourses is an array before iterating
      if (Array.isArray(enrolledCourses)) {
        enrolledCourses.forEach((course) => {
          if (course.teacherId && !teacherIds.has(course.teacherId._id)) {
            teacherIds.add(course.teacherId._id);
            uniqueTeachers.push({
              ...course.teacherId,
              courseName: course.title,
            });
          }
        });
      }
      
      setTeachers(uniqueTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
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
          {item.courseName}
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

  if (teachers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyText}>No Conversations Yet</Text>
        <Text style={styles.emptySubtext}>
          Enroll in courses to chat with instructors
        </Text>
        <TouchableOpacity
          style={styles.browseCoursesButton}
          onPress={() => router.push('/(tabs)/courses')}
        >
          <Text style={styles.browseCoursesButtonText}>Browse Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={teachers}
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
