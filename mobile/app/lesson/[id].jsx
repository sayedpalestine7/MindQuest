import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/useAuth';
import courseService from '../../src/services/courseService';
import progressService from '../../src/services/progressService';
import LessonContent from '../../src/components/LessonContent';
import LessonSidebar from '../../src/components/LessonSidebar';
import QuizModal from '../../src/components/quiz/QuizModal';

const { width } = Dimensions.get('window');

export default function LessonScreen() {
  const { id } = useLocalSearchParams(); // lesson ID
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  useEffect(() => {
    loadLessonData();
  }, [id]);

  const loadLessonData = async () => {
    try {
      setLoading(true);

      // We need to find the course that contains this lesson
      // For now, we'll need to pass courseId as a parameter or fetch from backend
      // Let's assume we get it from navigation params or we need to add a new endpoint

      // Temporary: Get from navigation state or AsyncStorage
      // In production, you'd want to pass courseId when navigating here

      // For now, let's create a workaround by fetching enrolled courses
      if (user?._id) {
        const enrolledCourses = await courseService.getEnrolledCourses(user._id, false);
        const targetLessonId = id ? id.toString() : '';

        const normalizeLessonId = (lesson) => {
          if (!lesson) return '';
          if (typeof lesson === 'string') return lesson;
          if (lesson._id) return lesson._id.toString();
          if (lesson.toString) return lesson.toString();
          return '';
        };
        
        // Find the course containing this lesson
        let foundCourse = null;
        for (const course of enrolledCourses) {
          const lessonExists = course.lessonIds?.some((l) => normalizeLessonId(l) === targetLessonId);
          if (lessonExists) {
            foundCourse = course;
            break;
          }
        }

        const loadCourseAndLesson = async (courseId, desiredLessonId) => {
          const fullCourse = await courseService.getCourseById(courseId, false);
          setCourse(fullCourse);

          const lesson = fullCourse.lessonIds?.find((l) => normalizeLessonId(l) === desiredLessonId);
          if (lesson) {
            setCurrentLesson(lesson);
          } else if (fullCourse.lessonIds && fullCourse.lessonIds.length > 0) {
            const fallbackLesson = fullCourse.lessonIds[0];
            setCurrentLesson(fallbackLesson);
            const fallbackId = normalizeLessonId(fallbackLesson);
            if (fallbackId && fallbackId !== desiredLessonId) {
              router.replace(`/lesson/${fallbackId}`);
            }
          }

          // Load progress
          const progressData = await progressService.getProgress(user._id, fullCourse._id);
          setProgress(progressData);
        };

        if (foundCourse) {
          await loadCourseAndLesson(foundCourse._id, targetLessonId);
        } else if (enrolledCourses.length > 0) {
          const fallbackCourse = enrolledCourses[0];
          await loadCourseAndLesson(fallbackCourse._id, targetLessonId);
        } else {
          Alert.alert('Error', 'Course not found or you are not enrolled');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !course || !currentLesson) return;

    try {
      setCompleting(true);
      
      const updatedProgress = await progressService.markLessonComplete(
        user._id,
        course._id,
        currentLesson._id
      );
      
      // Update local progress immediately
      setProgress(updatedProgress);

      // Auto-advance to next lesson
      const currentIndex = course.lessonIds.findIndex(l => l._id === currentLesson._id);
      if (currentIndex < course.lessonIds.length - 1) {
        const nextLesson = course.lessonIds[currentIndex + 1];
        router.push(`/lesson/${nextLesson._id}`);
      } else {
        Alert.alert('Congratulations!', 'You have completed all lessons!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      Alert.alert('Error', 'Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  const handleLessonSelect = (lessonId) => {
    setShowSidebar(false);
    router.push(`/lesson/${lessonId}`);
  };

  const handleQuizPress = () => {
    setShowSidebar(false);
    setShowQuizModal(true);
  };

  const normalizeId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();
    if (value.toString) return value.toString();
    return '';
  };

  const getCourseLessonIds = () => {
    return (course?.lessonIds || [])
      .map((lesson) => normalizeId(lesson))
      .filter(Boolean);
  };

  const getCompletedLessonIds = () => {
    const completed = (progress?.completedLessons || [])
      .map((lessonId) => normalizeId(lessonId))
      .filter(Boolean);
    const inCourse = new Set(getCourseLessonIds());
    return Array.from(new Set(completed)).filter((lessonId) => inCourse.has(lessonId));
  };

  const calculateProgress = () => {
    if (!course || !progress) return 0;
    const totalLessons = getCourseLessonIds().length || 1;
    const completedCount = getCompletedLessonIds().length;
    return Math.min(100, (completedCount / totalLessons) * 100);
  };

  const isLessonComplete = (lessonId) => {
    if (!progress) return false;
    const targetId = normalizeId(lessonId);
    return getCompletedLessonIds().includes(targetId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!course || !currentLesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  const progressPercentage = calculateProgress();
  const isComplete = isLessonComplete(currentLesson._id);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {course.title}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowSidebar(true)}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Lesson Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
        
        {currentLesson.fieldIds && currentLesson.fieldIds.length > 0 ? (
          <LessonContent fields={currentLesson.fieldIds} />
        ) : (
          <Text style={styles.emptyText}>No content available</Text>
        )}

        {/* Mark Complete Button */}
        {!isComplete && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>Mark as Complete</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isComplete && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </ScrollView>

      {/* Sidebar */}
      <LessonSidebar
        visible={showSidebar}
        course={course}
        currentLessonId={currentLesson._id}
        progress={progress}
        onClose={() => setShowSidebar(false)}
        onLessonSelect={handleLessonSelect}
        onQuizPress={handleQuizPress}
      />

      {/* Quiz Modal */}
      {showQuizModal && course && user && (
        <QuizModal
          visible={showQuizModal}
          courseId={course._id}
          quizId={course.quizId}
          studentId={user._id}
          onClose={() => setShowQuizModal(false)}
          onComplete={() => setShowQuizModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  menuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
});
