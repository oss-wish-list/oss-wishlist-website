import type { APIRoute } from 'astro';
import { generateState, getGitHubAuthUrl } from '../../../lib/github-oauth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, redirect, locals }) => {
  // In Astro 5 with adapter, we need to check both import.meta.env and process.env
  const clientId = import.meta.env.GITHUB_CLIENT_ID ?? process.env.GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.GITHUB_REDIRECT_URI ?? process.env.GITHUB_REDIRECT_URI;
  
  // Debug logging
  console.log('OAuth Debug:', {
    hasClientId: !!clientId,
    hasRedirectUri: !!redirectUri,
    clientIdPreview: clientId?.substring(0, 10),
    redirectUri: redirectUri,
    envKeys: Object.keys(process.env).filter(k => k.includes('GITHUB'))
  });
  
  if (!clientId || !redirectUri) {
    return new Response(
      JSON.stringify({ 
        error: 'GitHub OAuth not configured',
        debug: {
          hasClientId: !!clientId,
          hasRedirectUri: !!redirectUri,
          availableEnvVars: Object.keys(process.env).filter(k => k.includes('GITHUB'))
        }
      }), 
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