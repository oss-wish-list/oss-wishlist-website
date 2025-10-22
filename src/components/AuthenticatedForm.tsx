import React, { useEffect } from 'react';
import type { User } from '../lib/auth';

interface AuthenticatedFormProps {
  children: React.ReactNode;
  user: User | null;
  formType?: string;
}

/**
 * Simple wrapper for forms that require authentication
 * Redirects to /login if not authenticated
 */
export default function AuthenticatedForm({ children, user }: AuthenticatedFormProps) {
  useEffect(() => {
    if (!user) {
      // Get the current path relative to the base
      const basePath = import.meta.env.BASE_URL || '';
      const currentPath = window.location.pathname;
      
      // Strip the base path if it exists to get the relative path
      const relativePath = currentPath.startsWith(basePath) 
        ? currentPath.slice(basePath.length) || '/'
        : currentPath;
      
      // Redirect to login page with return URL (relative path only)
      const returnTo = encodeURIComponent(relativePath + window.location.search);
      window.location.href = `${basePath}/login?returnTo=${returnTo}`;
    }
  }, [user]);

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
