import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const envDebug = {
    GITHUB_CLIENT_ID: import.meta.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID || 'MISSING',
    GITHUB_CLIENT_SECRET: (import.meta.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET) ? 'SET' : 'MISSING',
    GITHUB_REDIRECT_URI: import.meta.env.GITHUB_REDIRECT_URI || process.env.GITHUB_REDIRECT_URI || 'MISSING',
    OAUTH_STATE_SECRET: (import.meta.env.OAUTH_STATE_SECRET || process.env.OAUTH_STATE_SECRET) ? 'SET' : 'MISSING',
    nodeEnv: process.env.NODE_ENV,
    // Show first few chars of actual values for debugging
    clientIdPreview: (import.meta.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID || '').substring(0, 8),
    redirectUriPreview: (import.meta.env.GITHUB_REDIRECT_URI || process.env.GITHUB_REDIRECT_URI || '').substring(0, 30)
  };

  return new Response(JSON.stringify(envDebug, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
