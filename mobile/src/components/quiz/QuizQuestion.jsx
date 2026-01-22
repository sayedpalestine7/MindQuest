import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QuizQuestion({
  question,
  questionNumber,
  answer,
  onAnswerSelect,
  showCorrect = false,
  submitted = false,
}) {
  const renderMCQ = () => {
    return question.options.map((option, index) => {
      const isSelected = answer !== undefined && parseInt(answer) === index;
      const isCorrect = index === question.correctAnswerIndex;
      
      let buttonStyle = [styles.optionButton];
      let iconName = 'radio-button-off';
      let iconColor = '#6B7280';
      
      if (showCorrect) {
        if (isCorrect) {
          buttonStyle.push(styles.optionButtonCorrect);
          iconName = 'checkmark-circle';
          iconColor = '#10B981';
        } else if (isSelected && !isCorrect) {
          buttonStyle.push(styles.optionButtonIncorrect);
          iconName = 'close-circle';
          iconColor = '#EF4444';
        }
      } else if (isSelected) {
        buttonStyle.push(styles.optionButtonSelected);
        iconName = 'radio-button-on';
        iconColor = '#4F46E5';
      }

      return (
        <TouchableOpacity
          key={index}
          style={buttonStyle}
          onPress={() => !showCorrect && onAnswerSelect(index)}
          disabled={showCorrect}
        >
          <Ionicons name={iconName} size={24} color={iconColor} />
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      );
    });
  };

  const renderTrueFalse = () => {
    return ['True', 'False'].map((option) => {
      const isSelected = answer && answer.toLowerCase() === option.toLowerCase();
      const isCorrect = question.correctAnswer.toLowerCase() === option.toLowerCase();
      
      let buttonStyle = [styles.tfButton];
      let iconName = 'radio-button-off';
      let iconColor = '#6B7280';
      
      if (showCorrect) {
        if (isCorrect) {
          buttonStyle.push(styles.optionButtonCorrect);
          iconName = 'checkmark-circle';
          iconColor = '#10B981';
        } else if (isSelected && !isCorrect) {
          buttonStyle.push(styles.optionButtonIncorrect);
          iconName = 'close-circle';
          iconColor = '#EF4444';
        }
      } else if (isSelected) {
        buttonStyle.push(styles.tfButtonSelected);
        iconName = 'radio-button-on';
        iconColor = '#4F46E5';
      }

      return (
        <TouchableOpacity
          key={option}
          style={buttonStyle}
          onPress={() => !showCorrect && onAnswerSelect(option)}
          disabled={showCorrect}
        >
          <Ionicons name={iconName} size={28} color={iconColor} />
          <Text style={styles.tfText}>{option}</Text>
        </TouchableOpacity>
      );
    });
  };

  const renderShortAnswer = () => {
    const isCorrect =
      showCorrect &&
      answer &&
      answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

    return (
      <View>
        <TextInput
          style={[
            styles.shortAnswerInput,
            showCorrect && isCorrect && styles.shortAnswerCorrect,
            showCorrect && !isCorrect && styles.shortAnswerIncorrect,
          ]}
          placeholder="Type your answer here..."
          value={answer || ''}
          onChangeText={onAnswerSelect}
          editable={!showCorrect}
          multiline
        />
        {showCorrect && !isCorrect && (
          <View style={styles.correctAnswerBox}>
            <Text style={styles.correctAnswerLabel}>Correct Answer:</Text>
            <Text style={styles.correctAnswerText}>{question.correctAnswer}</Text>
          </View>
        )}
      </View>
    );
  };

  const questionText = question?.question || question?.text || '';

  return (
    <View style={styles.container}>
      {/* Question Header */}
      <View style={styles.questionHeader}>
        <View style={styles.questionNumberBadge}>
          <Text style={styles.questionNumberText}>Q{questionNumber}</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.pointsText}>{question.points || 1} pts</Text>
        </View>
      </View>

      {/* Question Text */}
      <Text style={styles.questionText}>{questionText}</Text>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {question.type === 'mcq' && renderMCQ()}
        {question.type === 'tf' && (
          <View style={styles.tfContainer}>{renderTrueFalse()}</View>
        )}
        {question.type === 'short' && renderShortAnswer()}
      </View>

      {/* Explanation (shown after submission if correct answer) */}
      {showCorrect && question.explanation && (
        <View style={styles.explanationBox}>
          <View style={styles.explanationHeader}>
            <Ionicons name="information-circle" size={20} color="#4F46E5" />
            <Text style={styles.explanationTitle}>Explanation</Text>
          </View>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumberBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  optionButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  optionButtonCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  optionButtonIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  tfContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  tfButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  tfText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  shortAnswerInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  shortAnswerCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  shortAnswerIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  correctAnswerBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  correctAnswerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#047857',
  },
  explanationBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 6,
  },
  explanationText: {
    fontSize: 14,
    color: '#4338CA',
    lineHeight: 20,
  },
});
