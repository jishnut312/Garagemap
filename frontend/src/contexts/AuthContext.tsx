'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Mock Firebase auth for now - will be replaced when Firebase is installed
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock auth state - will be replaced with Firebase auth listener
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in - will be replaced with Firebase auth
    const mockUser = {
      uid: 'mock-uid-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      photoURL: null,
    };
    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token-' + Date.now());
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    // Mock sign up - will be replaced with Firebase auth
    const mockUser = {
      uid: 'mock-uid-' + Date.now(),
      email,
      displayName,
      photoURL: null,
    };
    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token-' + Date.now());
  };

  const signInWithGoogle = async () => {
    // Mock Google sign in - will be replaced with Firebase auth
    const mockUser = {
      uid: 'mock-google-uid-' + Date.now(),
      email: 'user@gmail.com',
      displayName: 'Google User',
      photoURL: 'https://via.placeholder.com/40',
    };
    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token-' + Date.now());
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('authToken');
  };

  const resetPassword = async (email: string) => {
    // Mock password reset - will be replaced with Firebase auth
    console.log('Password reset email sent to:', email);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
