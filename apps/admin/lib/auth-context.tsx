'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AdminUserSession {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'manager' | 'support';
}

interface AuthContextType {
  user: AdminUserSession | null;
  loading: boolean;
  login: (email: string, password: string, mfaCode?: string) => Promise<{ success: boolean; error?: string; requireMfa?: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const saved = localStorage.getItem('sc_admin_session');
      if (saved) {
        setUser(JSON.parse(saved));
      } else if (pathname !== '/login') {
        router.push('/login');
      }
    } catch {
      if (pathname !== '/login') router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, mfaCode?: string) => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mfaCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed',
          requireMfa: data.requireMfa,
        };
      }

      setUser(data.user);
      localStorage.setItem('sc_admin_session', JSON.stringify(data.user));
      router.push('/');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sc_admin_session');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
