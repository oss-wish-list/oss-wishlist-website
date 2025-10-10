import type { APIRoute } from 'astro';
import { generateState, getGitHubAuthUrl } from '../../../lib/github-oauth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return new Response(
      JSON.stringify({ error: 'GitHub OAuth not configured' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Generate secure state parameter
  const state = generateState();
  
  // Store state in a secure, httpOnly cookie
  cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/'
  });

  // Redirect to GitHub OAuth
  const authUrl = getGitHubAuthUrl(clientId, redirectUri, state);
  return redirect(authUrl);
};