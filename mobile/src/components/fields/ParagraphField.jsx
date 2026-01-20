import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

export default function ParagraphField({ content }) {
  const { width } = useWindowDimensions();

  if (!content) return null;

  return (
    <View style={styles.container}>
      <RenderHtml
        contentWidth={width - 40}
        source={{ html: content }}
        tagsStyles={tagsStyles}
      />
    </View>
  );
}

const tagsStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
  },
  p: {
    marginBottom: 12,
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  strong: {
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
  a: {
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  ul: {
    marginBottom: 12,
  },
  ol: {
    marginBottom: 12,
  },
  li: {
    marginBottom: 6,
  },
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
