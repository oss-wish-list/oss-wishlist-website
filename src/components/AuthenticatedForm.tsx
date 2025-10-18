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
      // Redirect to login page with return URL
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/oss-wishlist-website/login?returnTo=${returnTo}`;
    }
  }, [user]);

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
