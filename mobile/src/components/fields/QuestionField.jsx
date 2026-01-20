import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QuestionField({ field }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const { content } = field;
  
  if (!content || !content.question) return null;

  const { question, questionType, options, correctAnswer, correctAnswerIndex, explanation } = content;

  const handleSubmit = () => {
    let correct = false;

    if (questionType === 'mcq') {
      correct = parseInt(answer) === correctAnswerIndex;
    } else if (questionType === 'tf') {
      correct = answer.toLowerCase() === correctAnswer.toLowerCase();
    } else if (questionType === 'short') {
      correct = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    }

    setIsCorrect(correct);
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswer('');
    setSubmitted(false);
    setIsCorrect(false);
  };

  const renderInput = () => {
    if (questionType === 'mcq') {
      return (
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                answer === index.toString() && styles.optionButtonSelected,
                submitted && index === correctAnswerIndex && styles.optionButtonCorrect,
                submitted && answer === index.toString() && !isCorrect && styles.optionButtonIncorrect,
              ]}
              onPress={() => !submitted && setAnswer(index.toString())}
              disabled={submitted}
            >
              <Text style={[
                styles.optionText,
                answer === index.toString() && styles.optionTextSelected,
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    } else if (questionType === 'tf') {
      return (
        <View style={styles.tfContainer}>
          <TouchableOpacity
            style={[
              styles.tfButton,
              answer === 'true' && styles.tfButtonSelected,
              submitted && correctAnswer === 'true' && styles.tfButtonCorrect,
              submitted && answer === 'true' && !isCorrect && styles.tfButtonIncorrect,
            ]}
            onPress={() => !submitted && setAnswer('true')}
            disabled={submitted}
          >
            <Text style={[styles.tfText, answer === 'true' && styles.tfTextSelected]}>
              True
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tfButton,
              answer === 'false' && styles.tfButtonSelected,
              submitted && correctAnswer === 'false' && styles.tfButtonCorrect,
              submitted && answer === 'false' && !isCorrect && styles.tfButtonIncorrect,
            ]}
            onPress={() => !submitted && setAnswer('false')}
            disabled={submitted}
          >
            <Text style={[styles.tfText, answer === 'false' && styles.tfTextSelected]}>
              False
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <TextInput
          style={styles.textInput}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Type your answer..."
          editable={!submitted}
          multiline
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="help-circle" size={20} color="#4F46E5" />
        <Text style={styles.headerText}>Question</Text>
      </View>

      <Text style={styles.question}>{question}</Text>

      {renderInput()}

      {!submitted ? (
        <TouchableOpacity
          style={[styles.submitButton, !answer && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!answer}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isCorrect ? '#10B981' : '#EF4444'}
            />
            <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextIncorrect]}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
          </View>

          {explanation && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationLabel}>Explanation:</Text>
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  optionButtonSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  optionButtonCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  optionButtonIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 15,
    color: '#1F2937',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#4F46E5',
  },
  tfContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tfButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  tfButtonSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  tfButtonCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  tfButtonIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  tfText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tfTextSelected: {
    color: '#4F46E5',
  },
  textInput: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    padding: 14,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  feedbackCorrect: {
    backgroundColor: '#F0FDF4',
  },
  feedbackIncorrect: {
    backgroundColor: '#FEF2F2',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  feedbackTextCorrect: {
    color: '#10B981',
  },
  feedbackTextIncorrect: {
    color: '#EF4444',
  },
  explanationBox: {
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    marginBottom: 12,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  resetButton: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});
