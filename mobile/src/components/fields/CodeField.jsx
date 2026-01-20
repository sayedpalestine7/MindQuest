import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function CodeField({ content }) {
  if (!content) return null;

  const codeText = typeof content === 'string' ? content : content.code || content.text;
  const language = typeof content === 'object' ? content.language : 'javascript';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.language}>{language}</Text>
      </View>
      <ScrollView horizontal style={styles.codeScroll}>
        <Text style={styles.code}>{codeText}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  language: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  codeScroll: {
    padding: 16,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 14,
    lineHeight: 20,
    color: '#F9FAFB',
  },
});
