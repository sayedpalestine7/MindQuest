import React, { createContext, useEffect, useMemo, useState } from 'react';
import { platformStorage } from './storage';
import { login, registerStudent, registerTeacher, googleAuth } from '../api/auth';
import { tokenStorage } from '../api/client';
import notificationService from '../services/notificationService';

const USER_KEY = 'mindquest_user';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await tokenStorage.get();
        const storedUser = await platformStorage.getItem(USER_KEY);
        
        if (storedToken && storedUser) {
          // Verify the token is still valid by making a test request
          try {
            // The apiClient will automatically use the stored token
            // If it's invalid, the interceptor will clear it
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } catch (verifyError) {
            // Token is invalid, clear everything
            console.warn('Stored token is invalid, clearing auth state');
            await tokenStorage.clear();
            await platformStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const signIn = async ({ email, password }) => {
    const data = await login({ email, password });
    await tokenStorage.set(data.token);
    await platformStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    
    // Register for push notifications after successful login
    try {
      await notificationService.registerForPushNotifications();
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      // Don't fail login if push notification registration fails
    }
    
    return data;
  };

  const signUpStudent = async ({ name, email, password }) => {
    return registerStudent({ name, email, password });
  };

  const signUpTeacher = async ({
    name,
    email,
    password,
    specialization,
    institution,
    profileImage,
    certification,
  }) => {
    return registerTeacher({
      name,
      email,
      password,
      specialization,
      institution,
      profileImage,
      certification,
    });
  };

  const signInWithGoogle = async ({ googleIdToken, mode }) => {
    const data = await googleAuth({ token: googleIdToken, mode });

    if (data?.token && data?.user) {
      await tokenStorage.set(data.token);
      await platformStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      // Register for push notifications after successful login
      try {
        await notificationService.registerForPushNotifications();
      } catch (error) {
        console.error('Failed to register for push notifications:', error);
      }
    }

    return data;
  };

  const signOut = async () => {
    await tokenStorage.clear();
    await platformStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signUpStudent,
      signUpTeacher,
      signInWithGoogle,
      signOut,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
