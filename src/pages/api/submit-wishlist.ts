import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Received request content-type:', request.headers.get('content-type'));
    
    // Check if request has body
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);
    
    if (!rawBody.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Request body is empty' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { title, body: issueBody, labels } = body;

    // Validate required fields
    if (!title || !issueBody) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: title and body' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get GitHub token from environment
    const githubToken = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GitHub token not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'Server configuration error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create GitHub issue via API
    const response = await fetch('https://api.github.com/repos/oss-wish-list/wishlists/issues', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'OSS-Wishlist-Bot'
      },
      body: JSON.stringify({
        title,
        body: issueBody,
        labels: labels || ['wishlist']
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('GitHub API error:', response.status, errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to create GitHub issue',
        details: response.status === 401 ? 'Authentication failed' : 'GitHub API error'
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const issue = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      issue: {
        number: issue.number,
        url: issue.html_url,
        title: issue.title
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating wishlist issue:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};