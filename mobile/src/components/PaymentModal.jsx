import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import paymentService from '../services/paymentService';
import courseService from '../services/courseService';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Q7u3nEO6ey45WFZH2IqJ2hYuq5P9Cm6LbdO9Kz8UJLJ8D6Hd5l0e3kXF4sZ1Wx3S2V7M9N8P6RQ5T4Y3H2G1F0A'; // Replace with your actual key

// Lazy load Stripe to avoid native module errors in Expo Go
let StripeProvider = null;
let CardField = null;
let useStripe = null;

try {
  const stripeModule = require('@stripe/stripe-react-native');
  StripeProvider = stripeModule.StripeProvider;
  CardField = stripeModule.CardField;
  useStripe = stripeModule.useStripe;
} catch (error) {
  console.warn('Stripe native module not available. Payment will be simulated.');
}

function PaymentForm({ course, studentId, onSuccess, onCancel }) {
  const stripe = useStripe ? useStripe() : null;
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Check if Stripe is available
  const isStripeAvailable = StripeProvider && CardField && useStripe;

  useEffect(() => {
    if (isStripeAvailable) {
      createPaymentIntent();
    }
  }, []);

  const createPaymentIntent = async () => {
    try {
      const data = await paymentService.createPaymentIntent(course._id, studentId);
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      Alert.alert('Error', 'Failed to initialize payment');
      onCancel();
    }
  };

  const handlePayment = async () => {
    if (!isStripeAvailable) {
      // Simulate payment for Expo Go
      Alert.alert(
        'Payment Simulation',
        'Stripe requires a development build. For now, we\'ll simulate the payment.',
        [
          { text: 'Cancel', style: 'cancel', onPress: onCancel },
          {
            text: 'Simulate Payment',
            onPress: async () => {
              setLoading(true);
              try {
                // Directly enroll the student (simulating successful payment)
                await courseService.enrollInCourse(studentId, course._id);
                onSuccess();
              } catch (error) {
                Alert.alert('Error', 'Failed to enroll in course');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
      return;
    }

    if (!stripe || !clientSecret || !cardComplete) {
      Alert.alert('Error', 'Please enter valid card details');
      return;
    }

    try {
      setLoading(true);

      const { error, paymentIntent } = await stripe.confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent) {
        // Payment successful! Backend webhook will handle enrollment
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Enroll explicitly in case webhook hasn't processed yet
        try {
          await courseService.enrollInCourse(studentId, course._id);
        } catch (enrollError) {
          console.log('Already enrolled or webhook processed');
        }

        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'An error occurred during payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.coursePrice}>${course.price}</Text>
      </View>

      {!isStripeAvailable && (
        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            Stripe native module not available. Running in simulation mode.
          </Text>
        </View>
      )}

      {isStripeAvailable && CardField && (
        <View style={styles.cardFieldContainer}>
          <Text style={styles.label}>Card Details</Text>
          <CardField
            postalCodeEnabled={false}
            placeholder={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.cardStyle}
            style={styles.cardField}
            onCardChange={(cardDetails) => {
              setCardComplete(cardDetails.complete);
            }}
          />
          <Text style={styles.testCardHint}>
            Test card: 4242 4242 4242 4242, any future date, any CVC
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.payButton,
            (isStripeAvailable && !cardComplete && !loading) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={isStripeAvailable && !cardComplete && !loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
              <Text style={styles.payButtonText}>
                {isStripeAvailable ? `Pay $${course.price}` : 'Simulate Payment'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
        <Text style={styles.securityText}>
          {isStripeAvailable 
            ? 'Secure payment powered by Stripe'
            : 'Build app with native modules for real payments'}
        </Text>
      </View>
    </View>
  );
}

export default function PaymentModal({ visible, course, studentId, onClose, onSuccess }) {
  const PaymentContent = () => (
    <PaymentForm
      course={course}
      studentId={studentId}
      onSuccess={onSuccess}
      onCancel={onClose}
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Complete Payment</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {StripeProvider ? (
            <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
              <PaymentContent />
            </StripeProvider>
          ) : (
            <PaymentContent />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  courseInfo: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  coursePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
  },
  cardFieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardField: {
    height: 50,
    marginVertical: 8,
  },
  cardStyle: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testCardHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  payButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
});
