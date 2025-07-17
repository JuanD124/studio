'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- Hardcoded User Credentials ---
// You can change these credentials as needed.
const USERS = {
  gerente: { password: 'nuevaclave123', role: 'gerente' },
  empleado: { password: 'empleado123', role: 'empleado' },
};
// ---

type UserRole = 'gerente' | 'empleado';
interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
});

const SESSION_STORAGE_KEY = 'lanzaexpres-auth-user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from session storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const usernameLower = username.toLowerCase() as keyof typeof USERS;
    const userData = USERS[usernameLower];

    if (userData && userData.password === password) {
      const loggedInUser: User = { username: usernameLower, role: userData.role as UserRole };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
