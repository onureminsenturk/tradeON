'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserSettings } from '@/types/user';
import { getItem, setItem, removeItem } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (email: string, displayName: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function hashPasswordSync(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getItem<{ userId: string }>('session');
    if (session) {
      const users = getItem<User[]>('users') || [];
      const found = users.find(u => u.id === session.userId);
      if (found) setUser(found);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const users = getItem<User[]>('users') || [];
    const found = users.find(u => u.email === email.toLowerCase());
    if (!found) return { success: false, error: 'Bu e-posta adresiyle kayitli kullanici bulunamadi.' };

    const passHash = hashPasswordSync(password);
    if (found.passwordHash !== passHash) return { success: false, error: 'Sifre hatali.' };

    setItem('session', { userId: found.id });
    setUser(found);
    return { success: true };
  }, []);

  const register = useCallback((email: string, displayName: string, password: string) => {
    const users = getItem<User[]>('users') || [];
    if (users.find(u => u.email === email.toLowerCase())) {
      return { success: false, error: 'Bu e-posta adresi zaten kayitli.' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      displayName,
      passwordHash: hashPasswordSync(password),
      createdAt: new Date().toISOString(),
      settings: {
        currency: 'USD',
        startingBalance: 10000,
      },
    };

    users.push(newUser);
    setItem('users', users);
    setItem('session', { userId: newUser.id });
    setUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    removeItem('session');
    setUser(null);
  }, []);

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    if (!user) return;
    const updatedUser = { ...user, settings: { ...user.settings, ...settings } };
    setUser(updatedUser);

    const users = getItem<User[]>('users') || [];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      setItem('users', users);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
