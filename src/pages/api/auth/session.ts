import type { APIRoute } from 'astro';
import { verifySession } from '../../../lib/github-oauth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const sessionCookie = cookies.get('github_session');
    
    if (!sessionCookie?.value) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const sessionSecret = process.env.OAUTH_STATE_SECRET || import.meta.env.OAUTH_STATE_SECRET;
    
    const session = verifySession(sessionCookie.value, sessionSecret);
    
    if (!session) {
      // Clear invalid cookie
      cookies.delete('github_session', { path: '/oss-wishlist-website/' });
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Check if this is an old session without accessToken
    if (!session.accessToken) {
      // Clear old format cookie
      cookies.delete('github_session', { path: '/oss-wishlist-website/' });
      return new Response(JSON.stringify({ 
        authenticated: false,
        error: 'Session expired - please re-authenticate'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(session), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return new Response(JSON.stringify({ 
      authenticated: false,
      error: 'Session check failed'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};