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
      // Get the current full path including search params
      let basePath = import.meta.env.BASE_URL || '';
      // Ensure basePath ends with / for proper concatenation
      if (basePath && !basePath.endsWith('/')) {
        basePath += '/';
      }
      const currentPath = window.location.pathname;
      const searchParams = window.location.search;
      
      // Strip the base path if it exists to get the relative path
      let relativePath = currentPath.startsWith(basePath) 
        ? currentPath.slice(basePath.length)
        : currentPath;
      
      // Ensure relativePath starts with / (it's a path, not a fragment)
      if (relativePath && !relativePath.startsWith('/')) {
        relativePath = '/' + relativePath;
      }
      // Default to / if empty
      if (!relativePath) {
        relativePath = '/';
      }
      
      // Redirect to login page with return URL (relative path + search params)
      const fullReturnPath = relativePath + searchParams;
      const returnTo = encodeURIComponent(fullReturnPath);
      // basePath now guaranteed to have trailing slash or be empty
      window.location.href = `${basePath}login?returnTo=${returnTo}`;
    }
  }, [user]);

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
