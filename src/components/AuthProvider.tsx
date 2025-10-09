import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  login: string;
  id: number;
  name: string | null;
  email: string | null;
  avatar_url: string;
  authenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check cookie-based session first (most reliable)
      const response = await fetch('/oss-wishlist-website/api/auth/session');
      if (response.ok) {
        const sessionData = await response.json();
        setUser(sessionData);
        
        // Store in sessionStorage for faster future checks
        sessionStorage.setItem('github_session', JSON.stringify({
          ...sessionData,
          timestamp: Date.now()
        }));
        setLoading(false);
        return;
      }
      
      // Fallback: check session storage (for faster subsequent loads)
      const sessionDataString = sessionStorage.getItem('github_session');
      if (sessionDataString) {
        const sessionData = JSON.parse(sessionDataString);
        
        // Validate session timestamp (24 hour expiry)
        const now = Date.now();
        const sessionAge = now - (sessionData.timestamp || 0);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge < maxAge && sessionData.authenticated) {
          setUser(sessionData);
          setLoading(false);
          return;
        } else {
          sessionStorage.removeItem('github_session');
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = '/api/auth/github';
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      sessionStorage.removeItem('github_session'); // Clear session storage on logout
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}