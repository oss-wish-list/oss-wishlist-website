import type { APIRoute } from 'astro';
import { verifySession } from '../../../lib/github-oauth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    const sessionCookie = cookies.get('github_session');
    
    // Debug available cookies from request headers
    const cookieHeader = request.headers.get('cookie');
    console.log('Session check debug:', {
      rawCookieHeader: cookieHeader || 'no cookies',
      githubSessionExists: !!sessionCookie,
      githubSessionValue: sessionCookie?.value ? 'present' : 'missing'
    });
    
    console.log('Session check:', {
      hasCookie: !!sessionCookie?.value,
      cookieValue: sessionCookie?.value ? 'present' : 'missing'
    });
    
    if (!sessionCookie?.value) {
      console.log('No session cookie found, returning 401');
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const sessionSecret = process.env.OAUTH_STATE_SECRET;
    console.log('Session secret:', sessionSecret ? 'present' : 'missing');
    
    const session = verifySession(sessionCookie.value, sessionSecret);
    
    console.log('Session verification result:', session ? 'valid' : 'invalid');
    
    if (!session) {
      return new Response(JSON.stringify({ authenticated: false }), {
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