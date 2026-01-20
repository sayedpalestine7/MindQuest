import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import certificateService from '../../services/certificateService';

export default function CertificateModal({ 
  visible, 
  onClose, 
  courseId, 
  courseName, 
  studentId 
}) {
  const [loading, setLoading] = useState(false);
  const [certificatePath, setCertificatePath] = useState(null);

  const handleGenerateCertificate = async () => {
    setLoading(true);
    
    try {
      const result = await certificateService.generateCertificate(studentId, courseId);
      
      if (result.success) {
        setCertificatePath(result.filePath);
        Alert.alert(
          'Success!',
          'Certificate generated successfully!',
          [
            {
              text: 'Share',
              onPress: () => handleShareCertificate(result.filePath)
            },
            {
              text: 'Close',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to generate certificate');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Certificate generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareCertificate = async (filePath) => {
    const result = await certificateService.shareCertificate(filePath || certificatePath);
    
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to share certificate');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="ribbon" size={48} color="#6366f1" />
            </View>
            <Text style={styles.title}>Course Certificate</Text>
            <Text style={styles.courseName}>{courseName}</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.description}>
              Congratulations! You've completed this course.{'\n'}
              Generate your certificate to celebrate your achievement.
            </Text>

            <View style={styles.features}>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.featureText}>Official completion certificate</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="share-social" size={24} color="#6366f1" />
                <Text style={styles.featureText}>Easy to share with employers</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="document-text" size={24} color="#f59e0b" />
                <Text style={styles.featureText}>PDF format, professionally designed</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {certificatePath && (
              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={() => handleShareCertificate()}
                disabled={loading}
              >
                <Ionicons name="share-outline" size={20} color="#6366f1" />
                <Text style={styles.shareButtonText}>Share Certificate</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.generateButton]}
              onPress={handleGenerateCertificate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>
                    {certificatePath ? 'Regenerate' : 'Generate Certificate'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#f8fafc',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    padding: 24,
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  features: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  actions: {
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  generateButton: {
    backgroundColor: '#6366f1',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  shareButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'transparent',
  },
  closeButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
});
