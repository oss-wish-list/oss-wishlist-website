import type { APIRoute } from 'astro';
import { verifySession } from '../../lib/github-oauth';
import { fetchUserRepositories } from '../../lib/github-oauth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get and verify session from cookie
    const sessionCookie = cookies.get('github_session');
    if (!sessionCookie?.value) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify the session signature
    const sessionSecret = import.meta.env.OAUTH_STATE_SECRET || process.env.OAUTH_STATE_SECRET;
    const session = verifySession(sessionCookie.value, sessionSecret);
    
    if (!session || !session.authenticated) {
      // Clear invalid cookie
      cookies.delete('github_session', { path: '/' });
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check if session has accessToken (new format)
    if (!session.accessToken) {
      // Old session format without accessToken - clear it and require re-auth
      cookies.delete('github_session', { path: '/' });
      return new Response(JSON.stringify({ error: 'Session expired - please re-authenticate' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch public repositories from GitHub API using the username
    // This uses the public API endpoint and doesn't require repo OAuth scopes
    const repositories = await fetchUserRepositories(session.user.login);

    return new Response(JSON.stringify({ 
      repositories,
      user: session.user
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error getting repositories:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch repositories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};