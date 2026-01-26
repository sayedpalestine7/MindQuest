import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/useAuth';
import courseService from '../../src/services/courseService';
import progressService from '../../src/services/progressService';
import reviewService from '../../src/services/reviewService';
import studentService from '../../src/services/studentService';
import teacherService from '../../src/services/teacherService';
import { getCourseThumbnail, getUserAvatar } from '../../src/utils/imageUtils';
import ReviewModal from '../../src/components/profile/ReviewModal';
import EditProfileModal from '../../src/components/profile/EditProfileModal';
import EditTeacherProfileModal from '../../src/components/profile/EditTeacherProfileModal';
import CertificateModal from '../../src/components/profile/CertificateModal';
import RecentActivityTimeline from '../../src/components/profile/RecentActivityTimeline';
import PerformanceCharts from '../../src/components/profile/PerformanceCharts';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [teacherReviews, setTeacherReviews] = useState([]);
  const [showAllTeacherCourses, setShowAllTeacherCourses] = useState(false);
  const [showAllTeacherReviews, setShowAllTeacherReviews] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    coursesCompleted: 0,
    coursesInProgress: 0,
    totalLessonsCompleted: 0,
    totalPoints: 0,
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'activity', 'performance', 'messages'
  const [courseProgressMap, setCourseProgressMap] = useState({});
  const [reviews, setReviews] = useState({});
  const [continueLearning, setContinueLearning] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [lastLoadedAt, setLastLoadedAt] = useState(0);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const reviewsLoadedRef = useRef(false);

  const STALE_MS = 60 * 1000;

  const ensureReviewsLoaded = useCallback(async (coursesArray = enrolledCourses) => {
    if (reviewsLoadedRef.current || loadingReviews) return;
    if (!Array.isArray(coursesArray) || coursesArray.length === 0) {
      setReviews({});
      reviewsLoadedRef.current = true;
      return;
    }

    setLoadingReviews(true);
    try {
      const reviewResults = await Promise.all(
        coursesArray.map(async (course) => {
          try {
            const review = await reviewService.getStudentReview(user._id, course._id);
            return { courseId: course._id, review };
          } catch (error) {
            if (error.response?.status !== 401) {
              console.error('Error loading review:', error);
            }
            return { courseId: course._id, review: null };
          }
        })
      );

      const reviewMap = {};
      reviewResults.forEach(({ courseId, review }) => {
        if (review) reviewMap[courseId] = review;
      });
      setReviews(reviewMap);
      reviewsLoadedRef.current = true;
    } finally {
      setLoadingReviews(false);
    }
  }, [enrolledCourses, loadingReviews, user]);

  const loadProfileData = useCallback(async ({ includeReviews = false, showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const handleRequestError = (label, fallback) => (error) => {
        if (error.response?.status !== 401) {
          console.error(`Error loading ${label}:`, error);
        }
        return fallback;
      };

      const [studentProfile, courses, allProgress] = await Promise.all([
        studentService.getStudentById(user._id).catch(handleRequestError('student profile', null)),
        courseService.getEnrolledCourses(user._id, false).catch(handleRequestError('enrolled courses', [])),
        progressService.getAllProgress(user._id).catch(handleRequestError('progress', [])),
      ]);

      if (studentProfile) {
        setProfileUser(studentProfile);
      }

      const coursesArray = Array.isArray(courses) ? courses : [];
      setEnrolledCourses(coursesArray);
      reviewsLoadedRef.current = false;
      
      // Create a map of courseId -> progress
      const progressMap = {};
      if (Array.isArray(allProgress)) {
        allProgress.forEach(p => {
          if (p.courseId) {
            const courseId = typeof p.courseId === 'object' ? p.courseId._id : p.courseId;
            progressMap[courseId] = p;
          }
        });
      }
      setCourseProgressMap(progressMap);

      // Calculate stats
      let completed = 0;
      let inProgress = 0;
      let lessonsCompleted = 0;
      let totalProgress = 0;

      coursesArray.forEach((course) => {
        const progress = progressMap[course._id];
        const totalLessons = course.totalLessons ?? course.lessonIds?.length ?? 0;
        const completedLessonsRaw = course.completedLessons ?? progress?.completedLessons?.length ?? 0;
        const completedLessons = Math.min(completedLessonsRaw, totalLessons);
        const computedProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const progressPercent = Math.min(100, course.progress ?? computedProgress);

        lessonsCompleted += completedLessons;
        totalProgress += progressPercent;

        if (totalLessons > 0 && completedLessons >= totalLessons) {
          completed++;
        } else if (progress || completedLessons > 0) {
          inProgress++;
        }
      });

      const overallProgress = coursesArray.length > 0
        ? Math.round(totalProgress / coursesArray.length)
        : 0;

      const totalPoints = studentProfile?.studentData?.score ?? user?.studentData?.score ?? user?.score ?? 0;

      setStats({
        totalCourses: coursesArray.length,
        coursesCompleted: completed,
        coursesInProgress: inProgress,
        totalLessonsCompleted: lessonsCompleted,
        totalPoints,
        overallProgress,
      });

      // Compute continue learning and recent activity
      if (Array.isArray(allProgress) && allProgress.length > 0) {
        const sortedProgress = [...allProgress].sort((a, b) => {
          const dateA = new Date(a.lastUpdated || a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.lastUpdated || b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        });

        const recentActivities = sortedProgress.slice(0, 3).map((p) => {
          const courseId = typeof p.courseId === 'object' ? p.courseId._id : p.courseId;
          const course = coursesArray.find((c) => c._id === courseId);
          return {
            id: `${courseId}-${p.updatedAt || p.createdAt || p.lastUpdated || ''}`,
            title: course?.title || 'Course activity',
            status: p.status || 'in-progress',
            timestamp: p.lastUpdated || p.updatedAt || p.createdAt || null,
          };
        });
        setRecentActivity(recentActivities);

        const latest = sortedProgress[0];
        const latestCourseId = typeof latest.courseId === 'object' ? latest.courseId._id : latest.courseId;
        const latestCourse = coursesArray.find((c) => c._id === latestCourseId);
        if (latestCourse) {
          const lessons = latestCourse.lessonIds || [];
          const firstLesson = lessons?.[0];
          const firstLessonId = typeof firstLesson === 'object' ? firstLesson?._id : firstLesson;
          const lessonIdList = lessons
            .map((l) => (typeof l === 'object' ? l?._id : l))
            .filter(Boolean)
            .map((l) => l.toString());
          const currentLessonId = latest.currentLessonId ? latest.currentLessonId.toString() : null;
          const validCurrentLessonId = currentLessonId && lessonIdList.includes(currentLessonId)
            ? currentLessonId
            : null;
          const resumeLessonId = validCurrentLessonId || (firstLessonId ? firstLessonId.toString() : null);
          const lessonTitle = lessons.find((l) => {
            const lessonId = typeof l === 'object' ? l?._id : l;
            return lessonId && resumeLessonId && lessonId.toString() === resumeLessonId;
          })?.title;
          const completedLessons = latestCourse.completedLessons ?? latest.completedLessons?.length ?? 0;
          const totalLessons = latestCourse.totalLessons ?? lessons.length ?? 0;
          const progressPercent = latestCourse.progress ?? (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);

          setContinueLearning({
            courseId: latestCourse._id,
            courseTitle: latestCourse.title,
            lessonTitle,
            completedLessons,
            totalLessons,
            progressPercent,
            resumeLessonId,
          });
        } else {
          setContinueLearning(null);
        }
      } else {
        setContinueLearning(null);
        setRecentActivity([]);
      }

      if (includeReviews) {
        await ensureReviewsLoaded(coursesArray);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
      setInitialLoaded(true);
      setLastLoadedAt(Date.now());
    }
  }, [ensureReviewsLoaded, user]);

  const loadTeacherProfile = useCallback(async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const handleRequestError = (label, fallback) => (error) => {
        if (error.response?.status !== 401) {
          console.error(`Error loading ${label}:`, error);
        }
        return fallback;
      };

      const teacherByUser = await teacherService
        .getTeacherByUserId(user._id)
        .catch(handleRequestError('teacher profile', null));

      if (!teacherByUser) {
        setTeacherProfile(null);
        setTeacherCourses([]);
        setTeacherReviews([]);
        return;
      }

      const fullTeacher = await teacherService
        .getTeacherById(teacherByUser._id)
        .catch(handleRequestError('teacher details', teacherByUser));

      const teacherData = fullTeacher || teacherByUser;
      setTeacherProfile(teacherData);
      setTeacherCourses(Array.isArray(teacherData.courses) ? teacherData.courses : []);

      const reviewTeacherId = teacherData.userId || teacherData._id || user._id;
      const reviews = await reviewService
        .getTeacherReviews(reviewTeacherId)
        .catch(handleRequestError('teacher reviews', []));
      setTeacherReviews(Array.isArray(reviews) ? reviews : []);
    } catch (error) {
      console.error('Error loading teacher profile data:', error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
      setInitialLoaded(true);
      setLastLoadedAt(Date.now());
    }
  }, [user]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        const now = Date.now();
        const shouldReload = !initialLoaded || now - lastLoadedAt > STALE_MS;
        if (isTeacher) {
          if (shouldReload) {
            loadTeacherProfile({ showLoader: !initialLoaded });
          }
        } else {
          if (shouldReload) {
            loadProfileData({ includeReviews: activeTab === 'courses', showLoader: !initialLoaded });
          } else if (activeTab === 'courses') {
            ensureReviewsLoaded();
          }
        }
      }
    }, [user, isTeacher, loadProfileData, loadTeacherProfile, initialLoaded, lastLoadedAt, activeTab, ensureReviewsLoaded])
  );

  useEffect(() => {
    if (!isTeacher && activeTab === 'courses') {
      ensureReviewsLoaded();
    }
  }, [activeTab, ensureReviewsLoaded, isTeacher]);

  const getCourseProgressData = (course) => {
    const progress = courseProgressMap[course._id];
    const totalLessons = course.totalLessons ?? course.lessonIds?.length ?? 0;
    const completedLessonsRaw = course.completedLessons ?? progress?.completedLessons?.length ?? 0;
    const completedLessons = Math.min(completedLessonsRaw, totalLessons);
    const computedProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const progressPercent = Math.min(100, course.progress ?? computedProgress);
    const firstLesson = course.lessonIds?.[0];
    const firstLessonId = typeof firstLesson === 'object' ? firstLesson?._id : firstLesson;
    const resumeLessonId = progress?.currentLessonId || firstLessonId || null;

    return {
      completedLessons,
      totalLessons,
      progressPercent,
      resumeLessonId,
    };
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isTeacher) {
      await loadTeacherProfile({ showLoader: false });
    } else {
      await loadProfileData({ includeReviews: activeTab === 'courses', showLoader: false });
    }
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleReviewCourse = (course) => {
    setSelectedCourse(course);
    setShowReviewModal(true);
  };

  const openDeleteReview = (review, course) => {
    setPendingDelete({ reviewId: review._id, courseId: course._id, courseTitle: course.title });
    setDeleteModalVisible(true);
  };

  const confirmDeleteReview = async () => {
    if (!pendingDelete?.reviewId) return;
    setDeletingReview(true);
    try {
      await reviewService.deleteReview(pendingDelete.reviewId);
      setReviews((prev) => {
        const updated = { ...prev };
        delete updated[pendingDelete.courseId];
        return updated;
      });
      setDeleteModalVisible(false);
      setPendingDelete(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert('Error', 'Failed to delete review');
    } finally {
      setDeletingReview(false);
    }
  };

  const renderCourseCard = (course) => {
    const progressData = getCourseProgressData(course);
    const review = reviews[course._id];

    return (
    <TouchableOpacity
      key={course._id}
      style={styles.courseCard}
      onPress={() => router.push(`/course/${course._id}`)}
    >
      <Image
        source={{ uri: getCourseThumbnail(course) }}
        style={styles.courseThumbnail}
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.courseTeacher}>{course.teacherId?.name}</Text>
        <Text style={styles.courseMetaText}>
          {progressData.completedLessons} / {progressData.totalLessons} lessons completed
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressData.progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{progressData.progressPercent}% Complete</Text>
        <View style={styles.courseActions}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              if (progressData.resumeLessonId) {
                router.push(`/lesson/${progressData.resumeLessonId}`);
              } else {
                router.push(`/course/${course._id}`);
              }
            }}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
          {!review ? (
            <TouchableOpacity
              style={styles.reviewIconButton}
              onPress={() => handleReviewCourse(course)}
            >
              <Ionicons name="star-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
          ) : (
            <View style={styles.reviewInfo}>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= review.rating ? 'star' : 'star-outline'}
                    size={14}
                    color={star <= review.rating ? '#F59E0B' : '#D1D5DB'}
                  />
                ))}
              </View>
              <TouchableOpacity
                onPress={() => openDeleteReview(review, course)}
                style={styles.deleteReviewIconButton}
              >
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const renderTeacherCourseCard = (course) => (
    <TouchableOpacity
      key={course._id}
      style={styles.teacherCourseCard}
      onPress={() => router.push(`/course/${course._id}`)}
    >
      <Image
        source={{ uri: getCourseThumbnail(course) }}
        style={styles.teacherCourseThumbnail}
      />
      <View style={styles.teacherCourseInfo}>
        <Text style={styles.teacherCourseTitle} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.teacherCourseMeta} numberOfLines={1}>
          {course.category || 'General'}
        </Text>
        <View style={styles.teacherRatingRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.teacherRatingText}>
            {course.rating ?? course.averageRating ?? 0}
          </Text>
          <Text style={styles.teacherRatingSubtext}>
            ({course.ratingCount ?? 0})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTeacherReviews = (reviewsList) => {
    if (!Array.isArray(reviewsList) || reviewsList.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No reviews yet</Text>
        </View>
      );
    }

    return reviewsList.map((review) => (
      <View key={review._id} style={styles.teacherReviewCard}>
        <View style={styles.teacherReviewHeader}>
          <Image
            source={{ uri: getUserAvatar(review.studentId) }}
            style={styles.teacherReviewAvatar}
          />
          <View style={styles.teacherReviewMeta}>
            <Text style={styles.teacherReviewName}>{review.studentId?.name || 'Student'}</Text>
            <Text style={styles.teacherReviewCourse} numberOfLines={1}>
              {review.courseId?.title || 'Course'}
            </Text>
          </View>
          <View style={styles.teacherReviewRating}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.teacherReviewRatingText}>{review.rating}</Text>
          </View>
        </View>
        {review.comment ? (
          <Text style={styles.teacherReviewComment}>{review.comment}</Text>
        ) : null}
      </View>
    ));
  };

  const renderContinueLearning = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Continue Learning</Text>
      {continueLearning ? (
        <View style={styles.continueCard}>
          <Text style={styles.continueCourseTitle} numberOfLines={2}>
            {continueLearning.courseTitle}
          </Text>
          {continueLearning.lessonTitle ? (
            <Text style={styles.continueLessonTitle} numberOfLines={1}>
              Next: {continueLearning.lessonTitle}
            </Text>
          ) : null}
          <Text style={styles.continueProgressText}>
            {continueLearning.completedLessons} / {continueLearning.totalLessons} lessons
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${continueLearning.progressPercent}%` }]} />
          </View>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => {
              if (continueLearning.resumeLessonId) {
                router.push(`/lesson/${continueLearning.resumeLessonId}`);
              } else {
                router.push(`/course/${continueLearning.courseId}`);
              }
            }}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text style={styles.resumeButtonText}>Resume Lesson</Text>
          </TouchableOpacity>

          {recentActivity.length > 0 && (
            <View style={styles.recentActivityContainer}>
              <Text style={styles.recentActivityTitle}>Recent Activity</Text>
              {recentActivity.map((activity) => (
                <View key={activity.id} style={styles.recentActivityItem}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <View style={styles.recentActivityTextWrap}>
                    <Text style={styles.recentActivityText} numberOfLines={1}>
                      {activity.title}
                    </Text>
                    {!!activity.timestamp && (
                      <Text style={styles.recentActivityTime}>
                        {formatRelativeTime(activity.timestamp)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyStateInline}>
          <Text style={styles.emptyText}>No active courses yet</Text>
          <TouchableOpacity
            style={styles.browseCourseButton}
            onPress={() => router.push('/(tabs)/courses')}
          >
            <Text style={styles.browseCourseButtonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading && !initialLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (isTeacher) {
    const totalCourses = teacherCourses.length || teacherProfile?.totalCourses || 0;
    const totalStudents = teacherCourses.reduce(
      (sum, course) => sum + (course.enrollmentCount ?? course.students ?? 0),
      0
    );
    const totalPoints = teacherProfile?.totalPoints || 0;
    const rating = teacherProfile?.rating || 0;

    const courseLimit = 3;
    const reviewLimit = 3;
    const visibleCourses = showAllTeacherCourses
      ? teacherCourses
      : teacherCourses.slice(0, courseLimit);
    const visibleReviews = showAllTeacherReviews
      ? teacherReviews
      : teacherReviews.slice(0, reviewLimit);

    return (
      <>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
          }
        >
          <View style={styles.header}>
            <Image
              source={{ uri: getUserAvatar(teacherProfile || user) }}
              style={styles.profileImage}
            />
            <Text style={styles.userName}>{teacherProfile?.name || user?.name}</Text>
            <Text style={styles.userEmail}>{teacherProfile?.email || user?.email}</Text>
            <View style={styles.roleBadgeTeacher}>
              <Ionicons name="school" size={14} color="#7C3AED" />
              <Text style={styles.roleBadgeTeacherText}>Teacher</Text>
            </View>
            {teacherProfile?.specialization ? (
              <Text style={styles.teacherSpecialization}>{teacherProfile.specialization}</Text>
            ) : null}
            <View style={styles.teacherStatsRow}>
              <View style={styles.teacherStatChip}>
                <Text style={styles.teacherStatValue}>{totalCourses}</Text>
                <Text style={styles.teacherStatLabel}>Courses</Text>
              </View>
              <View style={styles.teacherStatChip}>
                <Text style={styles.teacherStatValue}>{totalStudents}</Text>
                <Text style={styles.teacherStatLabel}>Students</Text>
              </View>
              <View style={styles.teacherStatChip}>
                <Text style={styles.teacherStatValue}>{rating}</Text>
                <Text style={styles.teacherStatLabel}>Rating</Text>
              </View>
              <View style={styles.teacherStatChip}>
                <Text style={styles.teacherStatValue}>{totalPoints}</Text>
                <Text style={styles.teacherStatLabel}>Points</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.editButton, !teacherProfile && styles.editButtonDisabled]}
              onPress={() => setShowEditModal(true)}
              disabled={!teacherProfile}
            >
              <Ionicons name="create-outline" size={18} color="#4F46E5" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Courses</Text>
            {teacherCourses.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No courses yet</Text>
              </View>
            ) : (
              <View style={styles.coursesGrid}>
                {visibleCourses.map((course) => renderTeacherCourseCard(course))}
                {teacherCourses.length > courseLimit ? (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowAllTeacherCourses((prev) => !prev)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllTeacherCourses ? 'Show less' : 'Press here for more'}
                    </Text>
                    <Ionicons
                      name={showAllTeacherCourses ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#4F46E5"
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {renderTeacherReviews(visibleReviews)}
            {teacherReviews.length > reviewLimit ? (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllTeacherReviews((prev) => !prev)}
              >
                <Text style={styles.showMoreText}>
                  {showAllTeacherReviews ? 'Show less' : 'Press here for more'}
                </Text>
                <Ionicons
                  name={showAllTeacherReviews ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#4F46E5"
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Messages</Text>
            <Text style={styles.messagesText}>
              Chat with your students from the chat list.
            </Text>
            <TouchableOpacity
              style={styles.messagesButton}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
              <Text style={styles.messagesButtonText}>Open Chat List</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="help-circle-outline" size={24} color="#1F2937" />
              <Text style={styles.settingText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showEditModal && (
          <EditTeacherProfileModal
            visible={showEditModal}
            teacher={teacherProfile}
            onClose={() => setShowEditModal(false)}
            onUpdate={() => {
              setShowEditModal(false);
              handleRefresh();
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: getUserAvatar(profileUser || user) }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{profileUser?.name || user?.name}</Text>
          <Text style={styles.userEmail}>{profileUser?.email || user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="book" size={14} color="#2563EB" />
            <Text style={styles.roleBadgeText}>Student</Text>
          </View>
          
          <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
            <Ionicons name="create-outline" size={18} color="#4F46E5" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="book" size={28} color="#4F46E5" />
            <Text style={styles.statValue}>{stats.totalCourses}</Text>
            <Text style={styles.statLabel}>Total Courses</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
            <Text style={styles.statValue}>{stats.coursesCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={28} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={28} color="#6366F1" />
            <Text style={styles.statValue}>{stats.overallProgress}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View> */}

        {renderContinueLearning()}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'courses' && styles.tabActive]}
            onPress={() => setActiveTab('courses')}
          >
            <Ionicons 
              name={activeTab === 'courses' ? 'book' : 'book-outline'} 
              size={20} 
              color={activeTab === 'courses' ? '#4F46E5' : '#6B7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'courses' && styles.tabTextActive]}>
              Courses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
            onPress={() => setActiveTab('activity')}
          >
            <Ionicons 
              name={activeTab === 'activity' ? 'time' : 'time-outline'} 
              size={20} 
              color={activeTab === 'activity' ? '#4F46E5' : '#6B7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>
              Activity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'performance' && styles.tabActive]}
            onPress={() => setActiveTab('performance')}
          >
            <Ionicons 
              name={activeTab === 'performance' ? 'stats-chart' : 'stats-chart-outline'} 
              size={20} 
              color={activeTab === 'performance' ? '#4F46E5' : '#6B7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'performance' && styles.tabTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
            onPress={() => setActiveTab('messages')}
          >
            <Ionicons 
              name={activeTab === 'messages' ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={20} 
              color={activeTab === 'messages' ? '#4F46E5' : '#6B7280'} 
            />
            <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
              Messages
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'courses' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Courses</Text>
              {enrolledCourses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="book-outline" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No enrolled courses yet</Text>
                  <TouchableOpacity
                    style={styles.browseCourseButton}
                    onPress={() => router.push('/(tabs)/courses')}
                  >
                    <Text style={styles.browseCourseButtonText}>Browse Courses</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.coursesGrid}>
                  {Array.isArray(enrolledCourses) && enrolledCourses.map((course) => renderCourseCard(course))}
                </View>
              )}
            </View>
          )}

          {activeTab === 'activity' && (
            <View style={styles.section}>
              <RecentActivityTimeline studentId={user._id} limit={20} />
            </View>
          )}

          {activeTab === 'performance' && (
            <View style={styles.section}>
              <PerformanceCharts studentId={user._id} />
            </View>
          )}

          {activeTab === 'messages' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Messages</Text>
              <Text style={styles.messagesText}>
                Chat with your instructors from the chat list.
              </Text>
              <TouchableOpacity
                style={styles.messagesButton}
                onPress={() => router.push('/(tabs)/chat')}
              >
                <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
                <Text style={styles.messagesButtonText}>Open Chat List</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {/* <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="language-outline" size={24} color="#1F2937" />
            <Text style={styles.settingText}>Language</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity> */}
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={24} color="#1F2937" />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Review Modal */}
      {showReviewModal && selectedCourse && (
        <ReviewModal
          visible={showReviewModal}
          course={selectedCourse}
          studentId={user._id}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={(review) => {
            if (!review?.courseId) return;
            const reviewCourseId = typeof review.courseId === 'object' ? review.courseId._id : review.courseId;
            if (!reviewCourseId) return;
            setReviews((prev) => ({ ...prev, [reviewCourseId]: review }));
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          visible={showEditModal}
          user={profileUser || user}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            handleRefresh();
          }}
        />
      )}

      {/* Certificate Modal */}
      {showCertificateModal && selectedCourse && (
        <CertificateModal
          visible={showCertificateModal}
          courseId={selectedCourse._id}
          courseName={selectedCourse.title}
          studentId={user._id}
          onClose={() => {
            setShowCertificateModal(false);
            setSelectedCourse(null);
          }}
        />
      )}

      {/* Delete Review Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteIconWrap}>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete review?</Text>
            <Text style={styles.deleteModalMessage}>
              This will remove your review for {pendingDelete?.courseTitle || 'this course'}.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deletingReview}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteReview}
                disabled={deletingReview}
              >
                {deletingReview ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteConfirmText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    marginBottom: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  roleBadgeTeacher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EDE9FE',
    marginBottom: 12,
  },
  roleBadgeTeacherText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  teacherSpecialization: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  editButtonDisabled: {
    opacity: 0.6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  statCard: {
    alignItems: 'center',
    width: '48%',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  continueCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  continueCourseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  continueLessonTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  continueProgressText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 8,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  recentActivityContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  recentActivityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  recentActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  recentActivityTextWrap: {
    flex: 1,
  },
  recentActivityText: {
    fontSize: 13,
    color: '#374151',
  },
  recentActivityTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyStateInline: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  teacherStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  teacherStatChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  teacherStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  teacherStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24,
  },
  browseCourseButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseCourseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coursesGrid: {
    gap: 16,
  },
  teacherCourseCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  teacherCourseThumbnail: {
    width: 120,
    height: 120,
  },
  teacherCourseInfo: {
    flex: 1,
    padding: 12,
  },
  teacherCourseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  teacherCourseMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  teacherRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  teacherRatingSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseThumbnail: {
    width: 120,
    height: 150,
  },
  teacherReviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  teacherReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teacherReviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  teacherReviewMeta: {
    flex: 1,
  },
  teacherReviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  teacherReviewCourse: {
    fontSize: 12,
    color: '#6B7280',
  },
  teacherReviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teacherReviewRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  teacherReviewComment: {
    fontSize: 13,
    color: '#374151',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  courseTeacher: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  courseMetaText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  progressText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 8,
  },
  courseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewIconButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  deleteReviewIconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  deleteModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  deleteIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginBottom: 12,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  deleteCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  deleteCancelText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  logoutText: {
    color: '#EF4444',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  messagesText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  messagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
  },
  messagesButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
