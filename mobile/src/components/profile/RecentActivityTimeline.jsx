import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import courseService from '../../services/courseService';
import progressService from '../../services/progressService';
import { getImageUrl } from '../../utils/imageUtils';

const ActivityItem = ({ activity }) => {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityDate.toLocaleDateString();
  };

  return (
    <View style={styles.activityItem}>
      <View style={styles.activityLeft}>
        <View style={styles.iconWrapper}>
          <Text style={styles.activityIcon}>{activity.icon}</Text>
        </View>
        <View style={styles.timeline} />
      </View>

      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityTime}>{getTimeAgo(activity.timestamp)}</Text>
        </View>

        <Text style={styles.activityDescription}>{activity.description}</Text>

        {activity.thumbnail && (
          <Image
            source={{ uri: getImageUrl(activity.thumbnail) }}
            style={styles.activityThumbnail}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        )}

        {activity.points && (
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.pointsText}>+{activity.points} points</Text>
          </View>
        )}

        {activity.score !== undefined && (
          <View style={[
            styles.scoreBadge,
            activity.score >= 80 ? styles.scoreGood : styles.scoreOk
          ]}>
            <Text style={styles.scoreText}>{activity.score}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function RecentActivityTimeline({ studentId, limit = 15 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivities = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      const [courses, progressList] = await Promise.all([
        courseService.getEnrolledCourses(studentId, false),
        progressService.getAllProgress(studentId),
      ]);

      const coursesArray = Array.isArray(courses) ? courses : [];
      const progressArray = Array.isArray(progressList) ? progressList : [];

      const courseMap = new Map(
        coursesArray.map((course) => [course._id?.toString(), course])
      );

      const timeline = progressArray
        .map((progress) => {
          const courseId =
            typeof progress.courseId === 'object' ? progress.courseId?._id : progress.courseId;
          const course = courseMap.get(courseId?.toString());
          const totalLessons = course?.totalLessons ?? course?.lessonIds?.length ?? 0;
          const completedLessons = Math.min(
            progress.completedLessons?.length ?? 0,
            totalLessons
          );
          const progressPercent =
            totalLessons > 0
              ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
              : 0;
          const isCompleted = totalLessons > 0 && completedLessons >= totalLessons;

          return {
            id: `${courseId}-${progress.updatedAt || progress.createdAt || ''}`,
            icon: isCompleted ? '🎓' : progress.quizScore ? '📝' : '📘',
            title: isCompleted ? 'Course completed' : 'Course progress',
            description: `${course?.title || 'Course'} • ${completedLessons}/${totalLessons} lessons`,
            thumbnail: course?.thumbnail,
            timestamp: progress.lastUpdated || progress.updatedAt || progress.createdAt,
            points: isCompleted ? 10 : undefined,
            score: progress.quizScore ?? undefined,
            progressPercent,
          };
        })
        .filter((item) => item.timestamp)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      setActivities(timeline);
      setError(null);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [studentId, limit]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={64} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>No activity yet</Text>
        <Text style={styles.emptyDescription}>
          Start learning to see your activity timeline here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchActivities(true)}
          colors={['#6366f1']}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {activities.map((activity, index) => (
        <ActivityItem 
          key={activity.id || index} 
          activity={activity}
          isLast={index === activities.length - 1}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  activityItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  activityLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activityIcon: {
    fontSize: 20,
  },
  timeline: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 8,
  },
  activityContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  activityDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  activityThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f59e0b',
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreGood: {
    backgroundColor: '#d1fae5',
  },
  scoreOk: {
    backgroundColor: '#fef3c7',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});
