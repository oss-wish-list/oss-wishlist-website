import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect }) => {
  // Simple manual OAuth URL for testing
  const clientId = import.meta.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.GITHUB_REDIRECT_URI || process.env.GITHUB_REDIRECT_URI;
  const scope = 'read:user user:email';
  const state = 'test-state-123';
  
  if (!clientId || !redirectUri) {
    return new Response('OAuth configuration missing', { status: 500 });
  }
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&response_type=code`;
  
  return redirect(authUrl);
};