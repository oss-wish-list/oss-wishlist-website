// API endpoint to create GitHub issues for wishlists
// 
// Repository configuration is in /src/config/github.ts
//
import type { APIRoute } from 'astro';
import { GITHUB_CONFIG } from '../../config/github.js';

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
    
    const { title, body: issueBody, labels, formData } = body;

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
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GitHub token not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'Server configuration error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If we have form data, create a clean, readable issue body
    let finalIssueBody = issueBody;
    if (formData) {
      // Map service IDs to proper service names
      const serviceMap: { [key: string]: string } = {
        'security-audit': 'Security Audit',
        'dependency-security-audit': 'Dependency Security Audit',
        'governance-setup': 'Governance Setup', 
        'project-governance-setup': 'Project Governance Setup',
        'legal-consultation': 'Legal Consultation',
        'stakeholder-mediation': 'Stakeholder Mediation',
        'funding-strategy': 'Funding Strategy'
      };
      
      const servicesList = formData.services.map((serviceId: string) => {
        const serviceName = serviceMap[serviceId] || serviceId;
        return `- ${serviceName}`;
      }).join('\n');
      
      // Create a clean, readable issue body similar to issue #5
      finalIssueBody = `**Project:** ${formData.projectTitle}
**Repository:** ${formData.projectUrl}
**Maintainer:** @${formData.maintainer}
**Urgency:** ${formData.urgency}

## Services Requested
${servicesList}

## Project Description
${formData.description}

${formData.additionalNotes ? `## Additional Notes
${formData.additionalNotes}` : ''}

---
*Submitted via [OSS Wishlist Platform](${process.env.PUBLIC_SITE_URL || 'https://oss-wishlist.com'})*`;
    }

    // Create GitHub issue via API
    const response = await fetch(GITHUB_CONFIG.API_ISSUES_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'OSS-Wishlist-Bot'
      },
      body: JSON.stringify({
        title,
        body: finalIssueBody,
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