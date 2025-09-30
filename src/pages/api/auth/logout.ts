import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Clear the session cookie
  cookies.delete('github_session', {
    path: '/',
  });
  
  return redirect('/maintainers?logout=success');
};