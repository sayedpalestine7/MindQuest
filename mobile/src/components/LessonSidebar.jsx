import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LessonSidebar({
  visible,
  course,
  currentLessonId,
  progress,
  onClose,
  onLessonSelect,
  onQuizPress,
}) {
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

  const isLessonComplete = (lessonId) => {
    if (!progress) return false;
    const targetId = normalizeId(lessonId);
    return getCompletedLessonIds().includes(targetId);
  };

  const totalLessons = getCourseLessonIds().length;
  const completedCount = getCompletedLessonIds().length;
  const progressPercent = totalLessons
    ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Course Content</Text>
              <Text style={styles.subtitle}>
                {completedCount} of {totalLessons} completed
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressPercent}%</Text>
          </View>

          <ScrollView style={styles.lessonList}>
            {course?.lessonIds?.map((lesson, index) => {
              const isComplete = isLessonComplete(lesson._id);
              const isCurrent = lesson._id === currentLessonId;

              return (
                <TouchableOpacity
                  key={lesson._id}
                  style={[
                    styles.lessonItem,
                    isCurrent && styles.lessonItemActive,
                  ]}
                  onPress={() => onLessonSelect(lesson._id)}
                >
                  <View style={styles.lessonNumber}>
                    {isComplete ? (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    ) : (
                      <Text style={[
                        styles.lessonNumberText,
                        isCurrent && styles.lessonNumberTextActive,
                      ]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  <View style={styles.lessonInfo}>
                    <Text style={[
                      styles.lessonTitle,
                      isCurrent && styles.lessonTitleActive,
                    ]}>
                      {lesson.title}
                    </Text>
                    {lesson.isPreview && (
                      <View style={styles.previewBadge}>
                        <Text style={styles.previewText}>Preview</Text>
                      </View>
                    )}
                  </View>

                  {isCurrent && (
                    <View style={styles.currentIndicator} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Final Quiz Section */}
            {course?.quizId && (
              <View style={styles.quizSection}>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.quizItem}
                  disabled={completedCount !== totalLessons}
                  onPress={onQuizPress}
                >
                  <View style={styles.quizIcon}>
                    <Ionicons name="trophy" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>Final Quiz</Text>
                    {completedCount !== totalLessons && (
                      <Text style={styles.quizLocked}>Complete all lessons to unlock</Text>
                    )}
                  </View>
                  {completedCount !== totalLessons && (
                    <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  lessonList: {
    flex: 1,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lessonItemActive: {
    backgroundColor: '#F9FAFB',
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  lessonNumberTextActive: {
    color: '#4F46E5',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 2,
  },
  lessonTitleActive: {
    fontWeight: '600',
    color: '#4F46E5',
  },
  previewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#10B981',
    borderRadius: 8,
    marginTop: 4,
  },
  previewText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentIndicator: {
    width: 4,
    height: 24,
    backgroundColor: '#4F46E5',
    borderRadius: 2,
    marginLeft: 8,
  },
  quizSection: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  quizItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  quizIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  quizLocked: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
