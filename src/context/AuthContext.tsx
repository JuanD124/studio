'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type Auth, type User } from 'firebase/auth';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { db, isFirebaseConfigInvalid } from '@/lib/firebase'; // Import db to ensure firebase is initialized

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const auth = getAuth(getApp());

  useEffect(() => {
    // This will run only if Firebase is correctly configured
    if (!isFirebaseConfigInvalid) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        });
        
        return () => unsubscribe();
    } else {
        // If Firebase config is invalid, stop loading and show the app as logged out
        setLoading(false);
    }
  }, [auth]);

  const register = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
