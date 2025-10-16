import React, { useState, useEffect } from 'react';
import { getApiPath } from '../config/app';

interface User {
  login: string;
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(getApiPath('/api/auth/session'));
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.authenticated) {
          setUser(sessionData.user || { login: 'User' });
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = getApiPath('/api/auth/github');
  };

  const handleLogout = async () => {
    try {
      await fetch(getApiPath('/api/auth/logout'), { method: 'POST' });
      setUser(null);
      window.location.href = getApiPath('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <button className="text-gray-500 px-4 py-2 rounded-lg cursor-wait">
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-700">{user.login}</span>
        <button
          onClick={handleLogout}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
      </svg>
      <span>Login</span>
    </button>
  );
}
