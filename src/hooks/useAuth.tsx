import React, { useState, useEffect, createContext, useContext } from 'react';
import type { User } from '../types';
import { db } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('sms_auth') || localStorage.getItem('sms_auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const storedUser = parsed.user;
        const currentUser = storedUser?.id ? db.users.getById(Number(storedUser.id)) : db.users.getById(Number(parsed.userId));
        if (
          currentUser &&
          storedUser?.email === currentUser.email &&
          storedUser?.role === currentUser.role
        ) {
          setUser({ ...currentUser, password_hash: '' });
          sessionStorage.setItem('sms_auth', JSON.stringify({ userId: currentUser.id, role: currentUser.role, user: { ...currentUser, password_hash: '' } }));
          localStorage.removeItem('sms_auth');
        }
      } catch { /* ignore */ }
    }
    const loadingTimer = window.setTimeout(() => setLoading(false), 850);
    return () => window.clearTimeout(loadingTimer);
  }, []);

  const login = (u: User) => {
    const sessionUser = { ...u, password_hash: '' };
    setUser(sessionUser);
    sessionStorage.setItem('sms_auth', JSON.stringify({ userId: u.id, role: u.role, user: sessionUser }));
    localStorage.removeItem('sms_auth');
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('sms_auth');
    localStorage.removeItem('sms_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
