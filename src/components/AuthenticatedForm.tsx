import React, { useState, useEffect } from 'react';

interface AuthenticatedFormProps {
  children: React.ReactNode;
  formType?: string;
}

export default function AuthenticatedForm({ children, formType = "form" }: AuthenticatedFormProps) {
  const [user, setUser] = useState(null);
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
    window.location.href = '/oss-wishlist-website/api/auth/github';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        <span className="ml-3 text-gray-600 text-lg">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Please sign in with GitHub to access this {formType}. We use GitHub authentication to verify identity and prevent spam.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-lg"
          >
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            Sign in with GitHub
          </button>
          <div className="mt-8 text-sm text-gray-500">
            <h4 className="font-medium text-gray-700 mb-2">Why we require GitHub authentication:</h4>
            <ul className="text-left inline-block">
              <li className="flex items-center mb-1">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verify authentic community members
              </li>
              <li className="flex items-center mb-1">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Prevent spam and abuse
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Connect with your open source profile
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}