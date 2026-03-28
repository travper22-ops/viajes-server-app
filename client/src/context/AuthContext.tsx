/**
 * AuthContext — Autenticación conectada al backend real
 * POST /api/v1/auth/login | /register | /logout
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, AuthResponse } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthResponse>;
  signup: (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  authFetch: <T>(path: string, opts?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ta_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restaurar sesión al arrancar
  useEffect(() => {
    const saved = localStorage.getItem('ta_user');
    if (saved && token) {
      try {
        const parsedUser = JSON.parse(saved) as User;
        setUser(parsedUser);
      } catch {
        // Ignore parse errors
      }
    }
    setLoading(false);
  }, [token]);

  const login = useCallback(async ({ email, password }: { email: string; password: string }): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json() as User & { session?: { access_token: string }; access_token?: string; error?: string };
      
      if (!r.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      
      // Server returns { success, token, data: { user, token } }
      const accessToken = (data as any).token || (data as any).access_token 
        || (data as any).data?.token || (data as any).data?.access_token
        || (data as any).session?.access_token || '';
      const userData = (data as any).data?.user || (data as any).user || data;
      
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('ta_user', JSON.stringify(userData));
      localStorage.setItem('ta_token', accessToken);
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async ({ 
    firstName, 
    lastName, 
    email, 
    password, 
    phone 
  }: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
    phone?: string 
  }): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: firstName, firstName, lastName, email, password, phone }),
      });
      const data = await r.json() as { error?: string };
      
      if (!r.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }
      
      // Para registro, el usuario debe confirmar email
      // No hacemos login automático, solo indicamos éxito
      return { success: true, message: 'Usuario registrado. Revisa tu email para confirmar.' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore network errors
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('ta_user');
    localStorage.removeItem('ta_token');
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    const r = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return r.json() as Promise<{ success: boolean; message?: string }>;
  }, []);

  const authFetch = useCallback(async <T,>(path: string, opts: RequestInit = {}): Promise<T> => {
    const r = await fetch(`${API}${path}`, {
      ...opts,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    const data = await r.json() as T & { error?: string };
    if (!r.ok) {
      throw new Error(data.error || `HTTP ${r.status}`);
    }
    return data;
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      isLoggedIn: !!user && !!token,
      login,
      signup,
      logout,
      forgotPassword,
      authFetch,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
