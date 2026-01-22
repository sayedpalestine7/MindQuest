import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import reviewService from '../../services/reviewService';

export default function ReviewModal({ visible, course, studentId, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      const response = await reviewService.createReview(course._id, rating, comment.trim());
      Alert.alert('Success', 'Review submitted successfully!');
      if (onSuccess && response?.review) {
        onSuccess(response.review);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rate This Course</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Course Info */}
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle} numberOfLines={2}>
              {course.title}
            </Text>
            <Text style={styles.courseTeacher}>{course.teacherId?.name}</Text>
          </View>

          {/* Star Rating */}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Your Rating</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </Text>
            )}
          </View>

          {/* Comment */}
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Your Review (Optional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your thoughts about this course..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={500}
              blurOnSubmit
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <Text style={styles.characterCount}>{comment.length}/500</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  courseInfo: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  courseTeacher: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginTop: 12,
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
