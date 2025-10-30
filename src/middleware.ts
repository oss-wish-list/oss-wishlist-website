/**
 * Astro Middleware for Authentication
 * 
 * This runs on every request and can:
 * 1. Protect routes that require authentication
 * 2. Add session data to locals for use in pages
 * 3. Handle common auth patterns like redirects
 * 
 * Configure protected routes in the PROTECTED_ROUTES array below
 */

import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/auth';
import { getBasePath } from './lib/paths';

/**
 * Routes that require authentication
 * Add paths here to automatically protect them
 * 
 * Note: /maintainers page handles its own auth via AuthenticatedForm component
 * so it's not listed here - users can view the page but must log in to use the form
 */
const PROTECTED_ROUTES = [
  '/api/wishlists/create',
  '/api/wishlists/update',
  '/api/submit-wishlist',
  '/api/close-wishlist',
];

/**
 * Routes that should redirect to home if user IS authenticated
 * (e.g., login pages)
 */
const GUEST_ONLY_ROUTES: string[] = [
  // Add routes here like '/login' if you have custom login pages
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, locals, redirect, request } = context;
  
  // Basic Auth for staging environment
  // Use process.env for server-side runtime variables in Node adapter
  const requireBasicAuth = process.env.REQUIRE_BASIC_AUTH === 'true';
  
  if (requireBasicAuth) {
    const authHeader = request.headers.get('Authorization');
    const expectedUser = process.env.BASIC_AUTH_USER || 'staging';
    const expectedPass = process.env.BASIC_AUTH_PASSWORD || 'changeme';
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Staging Environment"',
        },
      });
    }
    
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    if (username !== expectedUser || password !== expectedPass) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Staging Environment"',
        },
      });
    }
  }
  
  // Add X-Robots-Tag header if indexing is disabled (for staging environments)
  const disableIndexing = import.meta.env.DISABLE_INDEXING === 'true';
  
  // Get current path (without base path)
  const pathname = url.pathname.replace(getBasePath(), '/').replace('//', '/');
  
  // Check if route requires authentication
  const requiresAuth = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if route is for guests only
  const guestOnly = GUEST_ONLY_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Get session
  const session = getSession(cookies);
  
  // Add session to locals for access in pages
  locals.session = session;
  locals.user = session?.user ?? null;
  
  // Protect routes that require auth
  if (requiresAuth && !session) {
    const basePath = getBasePath();
    const redirectUrl = `${basePath}/`.replace('//', '/');
    return redirect(redirectUrl);
  }
  
  // Redirect authenticated users away from guest-only routes
  if (guestOnly && session) {
    const basePath = getBasePath();
    const redirectUrl = `${basePath}/`.replace('//', '/');
    return redirect(redirectUrl);
  }
  
  // Continue to next middleware/page
  const response = await next();
  
  // Add noindex header if indexing is disabled
  if (disableIndexing) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  
  return response;
});
