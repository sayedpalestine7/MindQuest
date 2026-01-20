import React, { createContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login, registerStudent, registerTeacher, googleAuth } from '../api/auth';
import { tokenStorage } from '../api/client';

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
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
        setToken(storedToken || null);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (error) {
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
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
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
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  const signOut = async () => {
    await tokenStorage.clear();
    await SecureStore.deleteItemAsync(USER_KEY);
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
