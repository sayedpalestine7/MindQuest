import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QuizTimer({ timeRemaining, onTimeUp, paused = false, onTimeChange }) {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    setTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (paused || time <= 0) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        const newTime = prev - 1;
        
        if (onTimeChange) {
          onTimeChange(newTime);
        }

        if (newTime <= 0) {
          clearInterval(timer);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paused, onTimeUp, onTimeChange]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (time <= 60) return '#EF4444'; // Red - under 1 minute
    if (time <= 300) return '#F59E0B'; // Orange - under 5 minutes
    return '#10B981'; // Green - plenty of time
  };

  const isLowTime = time <= 60;

  return (
    <View style={[styles.container, { backgroundColor: getTimerColor() + '15' }]}>
      <Ionicons name="time" size={16} color={getTimerColor()} />
      <Text
        style={[
          styles.timeText,
          { color: getTimerColor() },
          isLowTime && styles.timeTextPulse,
        ]}
      >
        {formatTime(time)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  timeTextPulse: {
    // Add animation class if needed
  },
});
