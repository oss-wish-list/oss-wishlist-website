import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect }) => {
  // Simple manual OAuth URL for testing
  const clientId = 'Ov23lidwsT9QjzlCC4i3';
  const redirectUri = 'http://172.27.233.228:4324/oss-wishlist-website/auth/callback';
  const scope = 'read:user user:email';
  const state = 'test-state-123';
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&response_type=code`;
  
  console.log('Manual OAuth test URL:', authUrl);
  return redirect(authUrl);
};