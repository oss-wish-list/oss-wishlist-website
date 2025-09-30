import type { APIRoute } from 'astro';
import { 
  verifyState, 
  exchangeCodeForToken, 
  fetchGitHubUser, 
  fetchUserRepositories,
  createSession,
  type SessionData
} from '../../lib/github-oauth';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  console.log('OAuth Callback Debug:', {
    code: code ? 'present' : 'missing',
    state: state ? 'present' : 'missing',
    error: error,
    allParams: Object.fromEntries(url.searchParams.entries())
  });
  
  // Check if we already have a valid session
  const existingSession = cookies.get('github_session')?.value;
  if (existingSession) {
    console.log('Already have valid session, redirecting');
    return redirect('/oss-wishlist-website/maintainers?auth=already_authenticated');
  }
  
  // Handle OAuth errors
  if (error) {
    console.error('GitHub OAuth error:', error);
    return redirect('/oss-wishlist-website/maintainers?error=auth_failed');
  }
  
  if (!code || !state) {
    console.error('Missing OAuth parameters:', { code: !!code, state: !!state });
    return redirect('/oss-wishlist-website/maintainers?error=missing_parameters');
  }
  
  // Verify state parameter
  const storedState = cookies.get('oauth_state')?.value;
  console.log('State verification:', { receivedState: state, storedState: storedState });
  
  if (!storedState || !verifyState(state, storedState)) {
    console.log('State verification failed');
    return redirect('/oss-wishlist-website/maintainers?error=invalid_state');
  }
  
  console.log('State verification passed');
  
  // Clear the state cookie
  cookies.delete('oauth_state');
  
  try {
    const clientId = import.meta.env.GITHUB_CLIENT_ID;
    const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET;
    const redirectUri = import.meta.env.GITHUB_REDIRECT_URI;
    
    console.log('Starting token exchange process');
    
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('GitHub OAuth configuration missing');
    }
    
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(clientId, clientSecret, code, redirectUri);
    
    // Get user information
    const user = await fetchGitHubUser(accessToken);
    
    // Get user's repositories
    const repositories = await fetchUserRepositories(accessToken);
    
    // Create session data
    const sessionData: SessionData = {
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
      repositories: repositories,
      authenticated: true,
    };
    
    // Create signed session token
    const sessionSecret = import.meta.env.OAUTH_STATE_SECRET;
    if (!sessionSecret) {
      throw new Error('Session secret not configured');
    }
    
    const sessionToken = createSession(sessionData, sessionSecret);
    
    // Set secure session cookie
    cookies.set('github_session', sessionToken, {
      httpOnly: true,
      secure: false, // Set to false for development with HTTP
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/oss-wishlist-website/', // Match the app base path
    });
    
    console.log('Session cookie set successfully for user:', user.login);
    console.log('Cookie settings:', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/oss-wishlist-website/'
    });
    
    // Verify the cookie was set by reading it back
    const cookieCheck = cookies.get('github_session');
    console.log('Cookie verification after setting:', {
      cookieExists: !!cookieCheck,
      cookieValue: cookieCheck?.value ? 'present' : 'missing'
    });
    
    // Redirect back to submit page with success
    return redirect('/oss-wishlist-website/maintainers?auth=success');
    
  } catch (error) {
    console.error('Error in GitHub OAuth callback:', error);
    
    // If we already have a session set, the error might be from a duplicate request
    const existingSession = cookies.get('github_session')?.value;
    if (existingSession) {
      console.log('Error occurred but session exists, redirecting to success');
      return redirect('/oss-wishlist-website/maintainers?auth=success');
    }
    
    return redirect('/oss-wishlist-website/maintainers?error=auth_processing_failed');
  }
};