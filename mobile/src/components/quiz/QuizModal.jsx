import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import QuizTimer from './QuizTimer';
import storageService from '../../services/storageService';
import progressService from '../../services/progressService';
import courseService from '../../services/courseService';

export default function QuizModal({
  visible,
  courseId,
  quizId,
  studentId,
  onClose,
  onComplete,
}) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      loadQuiz();
    }
  }, [visible, courseId, quizId]);

  useEffect(() => {
    // Save progress periodically
    if (quiz && !submitted) {
      saveProgress();
    }
  }, [currentQuestionIndex, answers, timeRemaining]);

  const loadQuiz = async () => {
    try {
      setLoading(true);

      // Check for saved progress
      const savedProgress = await storageService.getQuizProgress(courseId);
      
      if (savedProgress) {
        // Resume from saved progress
        setQuiz(savedProgress.quiz);
        setQuestions(savedProgress.questions);
        setCurrentQuestionIndex(savedProgress.currentQuestionIndex || 0);
        setAnswers(savedProgress.answers || {});
        setTimeRemaining(savedProgress.timeRemaining);
      } else {
        // Fetch fresh quiz data
        const quizData = await courseService.getCourseQuizzes(courseId);
        
        if (quizData && quizData.length > 0) {
          const currentQuiz = quizData[0]; // Assuming one quiz per course
          setQuiz(currentQuiz);
          
          // Shuffle questions for variety
          const shuffledQuestions = [...(currentQuiz.questionIds || [])].sort(
            () => Math.random() - 0.5
          );
          setQuestions(shuffledQuestions);

          // Set timer if quiz has time limit
          if (currentQuiz.timeLimit) {
            setTimeRemaining(currentQuiz.timeLimit * 60); // Convert minutes to seconds
          }
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      await storageService.saveQuizProgress(courseId, {
        quiz,
        questions,
        currentQuestionIndex,
        answers,
        timeRemaining,
      });
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Quiz',
      'Are you sure you want to submit? You cannot change your answers after submitting.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            await calculateScore();
          },
        },
      ]
    );
  };

  const calculateScore = async () => {
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((question) => {
      const userAnswer = answers[question._id];
      totalPoints += question.points || 1;

      if (question.type === 'mcq') {
        if (userAnswer !== undefined && parseInt(userAnswer) === question.correctAnswerIndex) {
          correctCount++;
          earnedPoints += question.points || 1;
        }
      } else if (question.type === 'tf') {
        if (
          userAnswer &&
          userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()
        ) {
          correctCount++;
          earnedPoints += question.points || 1;
        }
      } else if (question.type === 'short') {
        if (
          userAnswer &&
          userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
        ) {
          correctCount++;
          earnedPoints += question.points || 1;
        }
      }
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    setScore(percentage);
    setSubmitted(true);
    setShowResults(true);

    // Show confetti for high scores
    if (percentage >= 80) {
      setShowConfetti(true);
    }

    // Submit to backend
    try {
      await progressService.submitQuizScore(studentId, courseId, percentage, totalPoints);
      await storageService.removeQuizProgress(courseId);
    } catch (error) {
      console.error('Error submitting quiz score:', error);
    }
  };

  const handleRetry = () => {
    Alert.alert(
      'Retry Quiz',
      'This will clear your current answers. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: async () => {
            setCurrentQuestionIndex(0);
            setAnswers({});
            setSubmitted(false);
            setShowResults(false);
            setScore(0);
            setShowConfetti(false);
            
            // Shuffle questions again
            const shuffled = [...questions].sort(() => Math.random() - 0.5);
            setQuestions(shuffled);

            // Reset timer
            if (quiz?.timeLimit) {
              setTimeRemaining(quiz.timeLimit * 60);
            }

            await storageService.removeQuizProgress(courseId);
          },
        },
      ]
    );
  };

  const handleTimeUp = () => {
    Alert.alert('Time Up!', 'The quiz time has expired. Submitting your answers...', [
      { text: 'OK', onPress: calculateScore },
    ]);
  };

  const handleReviewToggle = (filter) => {
    // Filter will be handled in QuizResults component
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </Modal>
    );
  }

  if (showResults) {
    return (
      <Modal visible={visible} animationType="slide">
        <QuizResults
          score={score}
          questions={questions}
          answers={answers}
          onClose={() => {
            onComplete?.(score);
            onClose();
          }}
          onRetry={handleRetry}
        />
        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            fadeOut
            autoStart
            onAnimationEnd={() => setShowConfetti(false)}
          />
        )}
      </Modal>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{quiz?.title || 'Quiz'}</Text>
            <Text style={styles.headerSubtitle}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {timeRemaining !== null && (
              <QuizTimer
                timeRemaining={timeRemaining}
                onTimeUp={handleTimeUp}
                paused={timerPaused}
                onTimeChange={setTimeRemaining}
              />
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {answeredCount}/{questions.length} answered
          </Text>
        </View>

        {/* Question */}
        <ScrollView style={styles.content}>
          {currentQuestion && (
            <QuizQuestion
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              answer={answers[currentQuestion._id]}
              onAnswerSelect={(answer) =>
                handleAnswerSelect(currentQuestion._id, answer)
              }
            />
          )}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentQuestionIndex === 0 ? '#9CA3AF' : '#4F46E5'}
            />
            <Text
              style={[
                styles.navButtonText,
                currentQuestionIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex === questions.length - 1 ? (
            <TouchableOpacity
              style={[styles.submitButton, answeredCount < questions.length && styles.submitButtonWarning]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                Submit Quiz ({answeredCount}/{questions.length})
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
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
  closeButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 4,
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  submitButtonWarning: {
    backgroundColor: '#F59E0B',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
