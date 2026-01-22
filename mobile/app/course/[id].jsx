import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/useAuth';
import courseService from '../../src/services/courseService';
import reviewService from '../../src/services/reviewService';
import { getCourseThumbnail, getUserAvatar } from '../../src/utils/imageUtils';
import PaymentModal from '../../src/components/PaymentModal';
import QuizModal from '../../src/components/quiz/QuizModal';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Load course
      const courseData = await courseService.getCourseById(id);
      setCourse(courseData);

      // Check if enrolled
      if (user?._id) {
        const enrolledCourses = await courseService.getEnrolledCourses(user._id);
        const enrolled = enrolledCourses.some(c => c._id === id);
        setIsEnrolled(enrolled);
      }

      // Load reviews
      try {
        const reviewsData = await reviewService.getCourseReviews(id);
        setReviews(reviewsData || []);
      } catch (error) {
        console.log('Error loading reviews:', error);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to enroll in courses', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (isTeacher) {
      Alert.alert('Not Allowed', 'Teachers cannot enroll in courses.');
      return;
    }

    if (course.price === 0) {
      // Free course - direct enrollment
      await enrollFreeCourse();
    } else {
      // Paid course - show payment modal
      setShowPaymentModal(true);
    }
  };

  const enrollFreeCourse = async () => {
    try {
      setEnrolling(true);
      await courseService.enrollInCourse(user._id, course._id);
      setIsEnrolled(true);
      Alert.alert('Success', 'You have enrolled in this course!', [
        { text: 'Start Learning', onPress: () => router.push(`/lesson/${course.lessonIds[0]._id}`) },
      ]);
    } catch (error) {
      console.error('Error enrolling:', error);
      Alert.alert('Error', 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setIsEnrolled(true);
    Alert.alert('Success', 'Payment successful! You are now enrolled.', [
      { text: 'Start Learning', onPress: () => router.push(`/lesson/${course.lessonIds[0]._id}`) },
    ]);
  };

  const handleStartLearning = () => {
    if (course.lessonIds && course.lessonIds.length > 0) {
      router.push(`/lesson/${course.lessonIds[0]._id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Course not found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header Image */}
        <Image
          source={{ uri: getCourseThumbnail(course) }}
          style={styles.headerImage}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Category & Difficulty */}
          <View style={styles.badgeRow}>
            {course.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{course.category}</Text>
              </View>
            )}
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(course.difficulty) }]}>
              <Text style={styles.difficultyText}>{course.difficulty}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{course.title}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={styles.statText}>
                {course.averageRating ? course.averageRating.toFixed(1) : '0.0'} ({course.ratingCount || 0})
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={18} color="#6B7280" />
              <Text style={styles.statText}>{course.enrollmentCount || 0} students</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="book-outline" size={18} color="#6B7280" />
              <Text style={styles.statText}>{course.lessonIds?.length || 0} lessons</Text>
            </View>
          </View>

          {/* Instructor */}
          {course.teacherId && (
            <View style={styles.instructorCard}>
              <Image
                source={{ uri: getUserAvatar(course.teacherId) }}
                style={styles.instructorAvatar}
              />
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorLabel}>Instructor</Text>
                <Text style={styles.instructorName}>{course.teacherId.name}</Text>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Course</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          {/* Lessons */}
          {course.lessonIds && course.lessonIds.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Content</Text>
              {course.lessonIds.map((lesson, index) => (
                <View key={lesson._id} style={styles.lessonItem}>
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonContent}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    {lesson.isPreview && (
                      <View style={styles.previewBadge}>
                        <Text style={styles.previewText}>Preview</Text>
                      </View>
                    )}
                  </View>
                  {!isEnrolled && !lesson.isPreview && (
                    <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                  )}
                </View>
              ))}
              
              {/* Take Quiz Button */}
              {isEnrolled && course.quizId && (
                <TouchableOpacity
                  style={styles.quizButton}
                  onPress={() => setShowQuizModal(true)}
                >
                  <Ionicons name="trophy" size={20} color="#FFFFFF" />
                  <Text style={styles.quizButtonText}>Take Final Quiz</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Student Reviews</Text>
              {reviews.slice(0, 3).map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>
                      {review.studentId?.name || 'Anonymous'}
                    </Text>
                    <View style={styles.reviewRating}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.reviewRatingText}>{review.rating}</Text>
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          {course.price === 0 ? (
            <Text style={styles.freePrice}>Free</Text>
          ) : (
            <Text style={styles.price}>${course.price}</Text>
          )}
        </View>
        
        {isEnrolled ? (
          <TouchableOpacity
            style={styles.enrolledButton}
            onPress={handleStartLearning}
          >
            <Text style={styles.enrolledButtonText}>Continue Learning</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : isTeacher ? (
          <View style={styles.teacherEnrollBlocked}>
            <Text style={styles.teacherEnrollBlockedText}>Teachers can’t enroll in courses.</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.enrollButtonText}>
                  {course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Modal */}
      {showPaymentModal && course && (
        <PaymentModal
          visible={showPaymentModal}
          course={course}
          studentId={user?._id}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Quiz Modal */}
      {showQuizModal && course && user && (
        <QuizModal
          visible={showQuizModal}
          courseId={course._id}
          quizId={course.quizId}
          studentId={user._id}
          onClose={() => setShowQuizModal(false)}
          onComplete={(score) => {
            console.log('Quiz completed with score:', score);
            setShowQuizModal(false);
          }}
        />
      )}
    </>
  );
}

function getDifficultyColor(difficulty) {
  const colors = {
    Beginner: '#10B981',
    Intermediate: '#F59E0B',
    Advanced: '#EF4444',
  };
  return colors[difficulty] || '#6B7280';
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
  headerImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 24,
  },
  instructorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
  },
  instructorInfo: {
    marginLeft: 12,
  },
  instructorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  lessonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonTitle: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#10B981',
    borderRadius: 8,
    marginLeft: 8,
  },
  previewText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewCard: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  teacherEnrollBlocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  teacherEnrollBlockedText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  priceContainer: {
    flex: 1,
  },
  freePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  enrolledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  enrolledButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  quizButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
