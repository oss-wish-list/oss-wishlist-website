import type { APIRoute } from 'astro';

export const prerender = false;

// Support both GET and POST for logout
export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Clear the session cookie (standard logout - doesn't revoke OAuth)
  cookies.delete('github_session', {
    path: '/',
  });
  
  const basePath = import.meta.env.BASE_URL || '/';
  const normalized = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return redirect(`${normalized}?logout=success`);
};

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Clear the session cookie (standard logout - doesn't revoke OAuth)
  cookies.delete('github_session', {
    path: '/',
  });
  
  const basePath = import.meta.env.BASE_URL || '/';
  const normalized = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return redirect(`${normalized}?logout=success`);
};