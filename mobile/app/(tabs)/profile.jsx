import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/useAuth';
import courseService from '../../src/services/courseService';
import progressService from '../../src/services/progressService';
import reviewService from '../../src/services/reviewService';
import studentService from '../../src/services/studentService';
import { getCourseThumbnail, getUserAvatar } from '../../src/utils/imageUtils';
import ReviewModal from '../../src/components/profile/ReviewModal';
import EditProfileModal from '../../src/components/profile/EditProfileModal';
import CertificateModal from '../../src/components/profile/CertificateModal';
import RecentActivityTimeline from '../../src/components/profile/RecentActivityTimeline';
import PerformanceCharts from '../../src/components/profile/PerformanceCharts';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
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

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      const studentProfile = await studentService.getStudentById(user._id);
      if (studentProfile) {
        setProfileUser(studentProfile);
      }
      
      // Load enrolled courses - force fresh data without cache
      const courses = await courseService.getEnrolledCourses(user._id, false);
      const coursesArray = Array.isArray(courses) ? courses : [];
      setEnrolledCourses(coursesArray);

      // Load all progress data at once
      const allProgress = await progressService.getAllProgress(user._id);
      
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
          const resumeLessonId = latest.currentLessonId || firstLessonId || null;
          const lessonTitle = lessons.find((l) => typeof l === 'object' && l._id === resumeLessonId)?.title;
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

      // Fetch existing reviews for enrolled courses
      if (coursesArray.length > 0) {
        const reviewResults = await Promise.all(
          coursesArray.map(async (course) => {
            const review = await reviewService.getStudentReview(user._id, course._id);
            return { courseId: course._id, review };
          })
        );

        const reviewMap = {};
        reviewResults.forEach(({ courseId, review }) => {
          if (review) reviewMap[courseId] = review;
        });
        setReviews(reviewMap);
      } else {
        setReviews({});
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    await loadProfileData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
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

  const handleDeleteReview = (reviewId, courseId) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await reviewService.deleteReview(reviewId);
            setReviews((prev) => {
              const updated = { ...prev };
              delete updated[courseId];
              return updated;
            });
          } catch (error) {
            console.error('Error deleting review:', error);
            Alert.alert('Error', 'Failed to delete review');
          }
        },
      },
    ]);
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
                onPress={() => handleDeleteReview(review._id, course._id)}
                style={styles.deleteReviewButton}
              >
                <Text style={styles.deleteReviewText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
    );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
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
        <View style={styles.statsContainer}>
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
        </View>

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
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="language-outline" size={24} color="#1F2937" />
            <Text style={styles.settingText}>Language</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
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
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseThumbnail: {
    width: 120,
    height: 100,
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
    alignItems: 'center',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  deleteReviewButton: {
    marginTop: 4,
  },
  deleteReviewText: {
    fontSize: 11,
    color: '#EF4444',
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
