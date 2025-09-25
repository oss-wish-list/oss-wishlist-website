import type { APIRoute } from 'astro';
import { 
  verifyState, 
  exchangeCodeForToken, 
  fetchGitHubUser, 
  fetchUserRepositories,
  createSession,
  type SessionData
} from '../../lib/github-oauth';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  // Handle OAuth errors
  if (error) {
    console.error('GitHub OAuth error:', error);
    return redirect('/oss-wishlist-website/submit?error=auth_failed');
  }
  
  if (!code || !state) {
    console.error('Missing OAuth parameters:', { code: !!code, state: !!state });
    return redirect('/oss-wishlist-website/submit?error=missing_parameters');
  }
  
  // Verify state parameter
  const storedState = cookies.get('oauth_state')?.value;
  if (!storedState || !verifyState(state, storedState)) {
    return redirect('/oss-wishlist-website/submit?error=invalid_state');
  }
  
  // Clear the state cookie
  cookies.delete('oauth_state');
  
  try {
    const clientId = import.meta.env.GITHUB_CLIENT_ID;
    const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET;
    const redirectUri = import.meta.env.GITHUB_REDIRECT_URI;
    
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
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    
    // Redirect back to submit page with success
    return redirect('/oss-wishlist-website/submit?auth=success');
    
  } catch (error) {
    console.error('Error in GitHub OAuth callback:', error);
    return redirect('/oss-wishlist-website/submit?error=auth_processing_failed');
  }
};