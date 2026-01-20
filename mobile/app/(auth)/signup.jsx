import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';

export default function SignupScreen() {
  const router = useRouter();
  const { signUpStudent, signUpTeacher } = useAuth();
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (role === 'teacher') {
        await signUpTeacher({
          name,
          email,
          password,
          specialization,
          institution,
        });
        setSuccess('Teacher application submitted. Please wait for approval.');
      } else {
        await signUpStudent({ name, email, password });
        setSuccess('Account created. Please sign in.');
      }

      setTimeout(() => router.replace('/(auth)/login'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>

      <View style={styles.roleRow}>
        <Pressable
          style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
          onPress={() => setRole('student')}
        >
          <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>Student</Text>
        </Pressable>
        <Pressable
          style={[styles.roleButton, role === 'teacher' && styles.roleButtonActive]}
          onPress={() => setRole('teacher')}
        >
          <Text style={[styles.roleText, role === 'teacher' && styles.roleTextActive]}>Teacher</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {role === 'teacher' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Specialization"
            value={specialization}
            onChangeText={setSpecialization}
          />
          <TextInput
            style={styles.input}
            placeholder="Institution"
            value={institution}
            onChangeText={setInstitution}
          />
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Pressable style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
      </Pressable>

      <Text style={styles.footer}>
        Already have an account? <Link href="/(auth)/login" style={styles.link}>Sign in</Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginRight: 8,
  },
  roleButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  roleText: {
    fontWeight: '600',
    color: '#111827',
  },
  roleTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    marginBottom: 8,
  },
  success: {
    color: '#16a34a',
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    textAlign: 'center',
  },
  link: {
    color: '#5b21b6',
    fontWeight: '600',
  },
});
