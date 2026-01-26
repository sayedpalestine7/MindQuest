import React, { useState, memo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import { getImageUrl } from '../../utils/imageUtils';

const ImageField = memo(({ content }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!content) return null;

  const imageUri = typeof content === 'string' ? content : content.url || content.src;
  const fullImageUrl = getImageUrl(imageUri);

  if (!fullImageUrl) return null;

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      ) : (
        <Image
          source={{ uri: fullImageUrl }}
          style={styles.image}
          contentFit="contain"
          transition={200}
          cachePolicy="memory-disk"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </View>
  );
});

ImageField.displayName = 'ImageField';

export default ImageField;

const styles = StyleSheet.create({
  container: {
    // marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFF',
    width: '100%',
  },
  image: {
    width: '100%',
    minHeight: 400,
    maxHeight: 400,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
});
