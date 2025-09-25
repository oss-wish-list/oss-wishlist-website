import { OAuthApp } from '@octokit/oauth-app';
import { Octokit } from '@octokit/rest';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = import.meta.env.GITHUB_CLIENT_SECRET;
const BASE_URL = import.meta.env.BASE_URL;
const GITHUB_REDIRECT_URI = import.meta.env.GITHUB_REDIRECT_URI || `${BASE_URL}/api/auth/github`;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  throw new Error('GitHub OAuth environment variables are not configured');
}

// Initialize OAuth app
export const githubOAuth = new OAuthApp({
  clientType: 'oauth-app',
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
});

// Generate GitHub OAuth URL
export function getGitHubAuthURL(state?: string): string {
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'repo read:org read:user user:email');
  
  if (state) {
    authUrl.searchParams.set('state', state);
  }
  
  return authUrl.toString();
}

// Exchange code for access token
export async function exchangeCodeForToken(code: string) {
  try {
    const { authentication } = await githubOAuth.createToken({
      code,
    });
    
    return authentication.token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error('Failed to authenticate with GitHub');
  }
}

// Get user information
export async function getGitHubUser(accessToken: string) {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    });
    
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const { data: emails } = await octokit.rest.users.listEmailsForAuthenticatedUser();
    
    // Get primary email
    const primaryEmail = emails.find(email => email.primary)?.email || user.email;
    
    return {
      id: user.id,
      username: user.login,
      name: user.name,
      email: primaryEmail,
      avatar_url: user.avatar_url,
      bio: user.bio,
    };
  } catch (error) {
    console.error('Error getting GitHub user:', error);
    throw new Error('Failed to get user information from GitHub');
  }
}

// Get user's repositories with admin access
export async function getUserRepositories(accessToken: string) {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    });
    
    // Get repositories where user has admin access
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
      affiliation: 'owner,collaborator'
    });
    
    // Filter for repositories where user has admin permissions
    const adminRepos = repos.filter(repo => 
      repo.permissions?.admin === true
    );
    
    return adminRepos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      private: repo.private,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
      stargazers_count: repo.stargazers_count,
      language: repo.language,
      updated_at: repo.updated_at,
    }));
  } catch (error) {
    console.error('Error getting user repositories:', error);
    throw new Error('Failed to get repositories from GitHub');
  }
}

// Verify user has admin access to a specific repository
export async function verifyRepoAccess(accessToken: string, owner: string, repo: string) {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    });
    
    const { data: repository } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    
    return repository.permissions?.admin === true;
  } catch (error) {
    console.error('Error verifying repo access:', error);
    return false;
  }
}

// Get repository details
export async function getRepositoryDetails(accessToken: string, owner: string, repo: string) {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    });
    
    const { data: repository } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    
    return {
      id: repository.id,
      name: repository.name,
      full_name: repository.full_name,
      description: repository.description,
      html_url: repository.html_url,
      stargazers_count: repository.stargazers_count,
      language: repository.language,
      topics: repository.topics || [],
      created_at: repository.created_at,
      updated_at: repository.updated_at,
    };
  } catch (error) {
    console.error('Error getting repository details:', error);
    throw new Error('Failed to get repository details');
  }
}