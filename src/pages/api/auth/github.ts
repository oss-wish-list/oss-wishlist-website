import type { APIRoute } from 'astro';
import { generateState, getGitHubAuthUrl } from '../../../lib/github-oauth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.GITHUB_REDIRECT_URI;
  
  console.log('GitHub OAuth Debug:', {
    clientId: clientId ? 'present' : 'missing',
    redirectUri: redirectUri ? 'present' : 'missing',
    redirectUriValue: redirectUri
  });
  
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
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/'
  });

  // Redirect to GitHub OAuth
  const authUrl = getGitHubAuthUrl(clientId, redirectUri, state);
  console.log('Redirecting to GitHub OAuth URL:', authUrl);
  return redirect(authUrl);
};