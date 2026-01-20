import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QuizQuestion from './QuizQuestion';

export default function QuizResults({
  score,
  questions,
  answers,
  onClose,
  onRetry,
}) {
  const [reviewMode, setReviewMode] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'correct', 'incorrect'

  const getScoreColor = () => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const getScoreMessage = () => {
    if (score >= 90) return 'Outstanding! 🎉';
    if (score >= 80) return 'Great Job! 🌟';
    if (score >= 70) return 'Well Done! 👍';
    if (score >= 60) return 'Good Effort! 💪';
    return 'Keep Practicing! 📚';
  };

  const calculateStats = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    questions.forEach((question) => {
      const userAnswer = answers[question._id];

      if (userAnswer === undefined || userAnswer === '') {
        unansweredCount++;
        return;
      }

      let isCorrect = false;

      if (question.type === 'mcq') {
        isCorrect = parseInt(userAnswer) === question.correctAnswerIndex;
      } else if (question.type === 'tf') {
        isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
      } else if (question.type === 'short') {
        isCorrect =
          userAnswer.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim();
      }

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    return { correctCount, incorrectCount, unansweredCount };
  };

  const filterQuestions = () => {
    if (filter === 'all') return questions;

    return questions.filter((question) => {
      const userAnswer = answers[question._id];

      if (!userAnswer) return false;

      let isCorrect = false;

      if (question.type === 'mcq') {
        isCorrect = parseInt(userAnswer) === question.correctAnswerIndex;
      } else if (question.type === 'tf') {
        isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
      } else if (question.type === 'short') {
        isCorrect =
          userAnswer.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim();
      }

      return filter === 'correct' ? isCorrect : !isCorrect;
    });
  };

  const stats = calculateStats();
  const filteredQuestions = filterQuestions();

  if (!reviewMode) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quiz Complete!</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Score Display */}
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
              <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
                {score}%
              </Text>
            </View>
            <Text style={styles.scoreMessage}>{getScoreMessage()}</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardCorrect]}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              <Text style={styles.statValue}>{stats.correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={[styles.statCard, styles.statCardIncorrect]}>
              <Ionicons name="close-circle" size={32} color="#EF4444" />
              <Text style={styles.statValue}>{stats.incorrectCount}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>

            {stats.unansweredCount > 0 && (
              <View style={[styles.statCard, styles.statCardUnanswered]}>
                <Ionicons name="help-circle" size={32} color="#9CA3AF" />
                <Text style={styles.statValue}>{stats.unansweredCount}</Text>
                <Text style={styles.statLabel}>Unanswered</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => setReviewMode(true)}
          >
            <Ionicons name="eye" size={20} color="#4F46E5" />
            <Text style={styles.reviewButtonText}>Review Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Review Mode
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setReviewMode(false)}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Answers</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All ({questions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'correct' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('correct')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'correct' && styles.filterButtonTextActive,
            ]}
          >
            Correct ({stats.correctCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'incorrect' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('incorrect')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'incorrect' && styles.filterButtonTextActive,
            ]}
          >
            Incorrect ({stats.incorrectCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.reviewContent}>
        {filteredQuestions.map((question, index) => (
          <View key={question._id} style={styles.reviewQuestionContainer}>
            <QuizQuestion
              question={question}
              questionNumber={questions.indexOf(question) + 1}
              answer={answers[question._id]}
              onAnswerSelect={() => {}}
              showCorrect={true}
              submitted={true}
            />
          </View>
        ))}

        {filteredQuestions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>
              No {filter} answers to show
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreMessage: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statCardCorrect: {
    backgroundColor: '#D1FAE5',
  },
  statCardIncorrect: {
    backgroundColor: '#FEE2E2',
  },
  statCardUnanswered: {
    backgroundColor: '#F3F4F6',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  reviewContent: {
    flex: 1,
    padding: 20,
  },
  reviewQuestionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
