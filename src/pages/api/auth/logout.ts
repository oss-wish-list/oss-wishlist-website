import type { APIRoute } from 'astro';

export const prerender = false;

// Support both GET and POST for logout
export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Clear the session cookie (standard logout - doesn't revoke OAuth)
  cookies.delete('github_session', {
    path: '/',
  });
  
  return redirect('/oss-wishlist-website/?logout=success');
};

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Clear the session cookie (standard logout - doesn't revoke OAuth)
  cookies.delete('github_session', {
    path: '/',
  });
  
  return redirect('/oss-wishlist-website/?logout=success');
};