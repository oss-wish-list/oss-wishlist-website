import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const sessionData = body.sessionData;
    
    if (!sessionData || !sessionData.authenticated) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Validate session timestamp (24 hour expiry)
    const now = Date.now();
    const sessionAge = now - (sessionData.timestamp || 0);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
      return new Response(JSON.stringify({ authenticated: false, error: 'Session expired' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      authenticated: true,
      user: sessionData.user,
      repositories: sessionData.repositories
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Session storage check error:', error);
    return new Response(JSON.stringify({ authenticated: false, error: 'Invalid session data' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};