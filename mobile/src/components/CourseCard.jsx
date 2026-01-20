import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { getCourseThumbnail } from '../utils/imageUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const CourseCard = memo(({ course, onPress }) => {
  const {
    title,
    description,
    thumbnail,
    difficulty,
    averageRating,
    ratingCount,
    enrollmentCount,
    category,
    price,
    teacherId,
  } = course;

  const difficultyColors = {
    Beginner: '#10B981',
    Intermediate: '#F59E0B',
    Advanced: '#EF4444',
  };

  const difficultyColor = difficultyColors[difficulty] || '#6B7280';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <Image
        source={{ uri: getCourseThumbnail(course) }}
        style={styles.thumbnail}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      {/* Difficulty Badge */}
      <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
        <Text style={styles.difficultyText}>{difficulty}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Category */}
        {category && (
          <Text style={styles.category}>{category}</Text>
        )}

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {/* Instructor */}
        {teacherId && (
          <View style={styles.instructorRow}>
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text style={styles.instructorName}>
              {teacherId.name || 'Instructor'}
            </Text>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Rating */}
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.statText}>
              {averageRating ? averageRating.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.statSubtext}>
              ({ratingCount || 0})
            </Text>
          </View>

          {/* Enrollment */}
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>
              {enrollmentCount || 0}
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            {price === 0 ? (
              <Text style={styles.freeText}>Free</Text>
            ) : (
              <Text style={styles.priceText}>${price}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  category: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructorName: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  priceContainer: {
    marginLeft: 'auto',
  },
  freeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;
