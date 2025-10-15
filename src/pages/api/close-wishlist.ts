import type { APIRoute } from 'astro';
import { verifySession } from '../../lib/github-oauth';
import { GITHUB_CONFIG } from '../../config/github';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get and verify session
    const sessionCookie = cookies.get('github_session');
    
    if (!sessionCookie?.value) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'You must be logged in to close a wishlist'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sessionSecret = import.meta.env.OAUTH_STATE_SECRET || process.env.OAUTH_STATE_SECRET;
    const session = verifySession(sessionCookie.value, sessionSecret);
    
    if (!session) {
      cookies.delete('github_session', { path: '/' });
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid session. Please log in again.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { issueNumber } = body;

    if (!issueNumber) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Issue number is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get GitHub token from session
    const githubToken = session.accessToken;
    if (!githubToken) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'GitHub authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use bot token for writing to the wishlists repo
    const botToken = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    if (!botToken) {
      return new Response(JSON.stringify({
        error: 'Configuration Error',
        message: 'GitHub bot token not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const username = session.user?.login || session.user?.name || 'unknown';

    // First, add a comment to the issue using bot token
    const commentResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.ORG}/${GITHUB_CONFIG.REPO}/issues/${issueNumber}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'OSS-Wishlist-Bot'
        },
        body: JSON.stringify({
          body: `Wishlist closed by @${username} via website`
        })
      }
    );

    if (!commentResponse.ok) {
      const errorData = await commentResponse.text();
      console.error('Failed to add comment:', commentResponse.status, errorData);
      return new Response(JSON.stringify({
        error: 'Failed to add comment',
        message: 'Could not add closing comment to issue'
      }), {
        status: commentResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Then close the issue using bot token
    const closeResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.ORG}/${GITHUB_CONFIG.REPO}/issues/${issueNumber}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'OSS-Wishlist-Bot'
        },
        body: JSON.stringify({
          state: 'closed'
        })
      }
    );

    if (!closeResponse.ok) {
      const errorData = await closeResponse.text();
      console.error('Failed to close issue:', closeResponse.status, errorData);
      return new Response(JSON.stringify({
        error: 'Failed to close wishlist',
        message: 'Could not close the GitHub issue'
      }), {
        status: closeResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const closedIssue = await closeResponse.json();

    return new Response(JSON.stringify({
      success: true,
      message: 'Wishlist closed successfully',
      issue: {
        number: closedIssue.number,
        url: closedIssue.html_url,
        state: closedIssue.state
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error closing wishlist:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
