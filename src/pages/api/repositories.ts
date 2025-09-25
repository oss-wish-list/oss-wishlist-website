import type { APIRoute } from 'astro';
import { getUserRepositories } from '../../lib/github';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get user session from cookie
    const sessionCookie = cookies.get('github_session');
    if (!sessionCookie?.value) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = JSON.parse(sessionCookie.value);
    if (!session.authenticated || !session.accessToken) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if session is expired (7 days)
    const isExpired = Date.now() - session.timestamp > 7 * 24 * 60 * 60 * 1000;
    if (isExpired) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user repositories
    const repositories = await getUserRepositories(session.accessToken);

    return new Response(JSON.stringify({ 
      repositories,
      user: {
        username: session.username,
        name: session.name,
        avatar_url: session.avatar_url,
      }
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