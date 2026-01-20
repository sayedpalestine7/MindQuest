import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../utils/imageUtils';

export default function AnimationField({ content }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef(null);

  // Extract video URL from content
  const videoUrl = typeof content === 'string' ? content : content?.animationUrl || content?.url;
  const fullVideoUrl = getImageUrl(videoUrl);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error playing/pausing video:', err);
    }
  };

  const handleRestart = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.replayAsync();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error restarting video:', err);
    }
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      
      // Loop the video when it finishes
      if (status.didJustFinish) {
        videoRef.current?.replayAsync();
      }
    } else if (status.error) {
      setIsLoading(false);
      setError(true);
      console.error('Video error:', status.error);
    }
  };

  if (!videoUrl) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="videocam-off" size={48} color="#999" />
        <Text style={styles.errorText}>Animation URL not available</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load animation</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={{ uri: fullVideoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={true}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        )}

        {!isLoading && (
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handlePlayPause}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={32} 
                color="#fff" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleRestart}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.labelContainer}>
        <Ionicons name="film" size={16} color="#6366f1" />
        <Text style={styles.label}>Animation</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  errorContainer: {
    padding: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
