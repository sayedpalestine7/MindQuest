import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';
import courseService from '../../src/services/courseService';
import CourseCard from '../../src/components/CourseCard';
import CourseFilters from '../../src/components/CourseFilters';

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    sortBy: 'newest',
  });

  const loadCourses = useCallback(async (pageNum = 1, currentFilters = filters, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page: pageNum,
        limit: 10,
        ...currentFilters,
      };

      const data = await courseService.getCourses(params);

      const coursesData = Array.isArray(data) ? data : (data.courses || []);

      if (append) {
        setCourses(prev => [...prev, ...coursesData]);
      } else {
        setCourses(coursesData);
      }

      const nextHasMore = data?.pagination?.hasMore ?? data?.hasMore ?? false;
      setHasMore(nextHasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!isTeacher) {
      loadCourses(1, filters, false);
    }
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    if (!isTeacher) {
      loadCourses(1, filters, false);
    } else {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadCourses(page + 1, filters, true);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleCoursePress = (courseId) => {
    router.push(`/course/${courseId}`);
  };

  const renderCourseCard = ({ item }) => (
    <CourseCard
      course={item}
      onPress={() => handleCoursePress(item._id)}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No courses found</Text>
        <Text style={styles.emptyText}>
          Try adjusting your filters or search term
        </Text>
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  if (isTeacher) {
    return (
      <View style={styles.teacherBlockContainer}>
        <Text style={styles.teacherBlockTitle}>Course Browser Unavailable</Text>
        <Text style={styles.teacherBlockText}>
          Teachers can’t browse or enroll in courses from the mobile app.
        </Text>
        <TouchableOpacity
          style={styles.teacherBlockButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.teacherBlockButtonText}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CourseFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <FlatList
        data={courses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  teacherBlockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  teacherBlockTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  teacherBlockText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  teacherBlockButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  teacherBlockButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
