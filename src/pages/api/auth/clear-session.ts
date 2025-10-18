import type { APIRoute } from 'astro';

/**
 * Dev helper endpoint to clear session
 * Navigate to /api/auth/clear-session to test login flow
 */
export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Clear the session cookie
  cookies.delete('github_session', {
    path: '/',
  });

  console.log('[Dev] Session cleared');
  
  // Redirect to home or maintainers page
  return redirect('/oss-wishlist-website/');
};
