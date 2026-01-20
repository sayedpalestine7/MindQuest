import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function YoutubeField({ content }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!content) return null;

  // Extract YouTube video ID from URL or direct ID
  const getVideoId = (url) => {
    if (!url) return null;
    
    // If it's already just an ID
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
      return url;
    }

    // Extract from various YouTube URL formats
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const videoId = getVideoId(typeof content === 'string' ? content : content.url || content.videoId);

  if (!videoId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid YouTube URL</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
      <YoutubePlayer
        height={220}
        play={playing}
        videoId={videoId}
        onReady={() => setLoading(false)}
        onChangeState={(state) => {
          if (state === 'playing') setPlaying(true);
          if (state === 'paused') setPlaying(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  errorContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
});
