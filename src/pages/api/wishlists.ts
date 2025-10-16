// API endpoint to fetch wishlists from GitHub issues
// 
// Repository configuration is in /src/config/github.ts
//
import type { APIRoute } from 'astro';
import { GITHUB_CONFIG } from '../../config/github.js';
import { parseIssueForm } from '../../lib/issue-form-parser.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const prerender = false;

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const CACHE_FILE = join(process.cwd(), 'public', 'wishlist-cache', 'all-wishlists.json');

// Cache configuration - for in-memory cache as fallback
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
let cachedWishlists: any = null;
let cacheTimestamp = 0;

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

interface ProjectItem {
  id: string;
  content: {
    number: number;
  };
  fieldValues: {
    nodes: Array<{
      field: {
        name: string;
      };
      name?: string;
      text?: string;
    }>;
  };
}

async function fetchGitHubIssues(): Promise<GitHubIssue[]> {
  const response = await fetch(
    `${GITHUB_CONFIG.API_ISSUES_URL}?state=open&per_page=100`,
    {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    },
  );
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`GitHub API error response:`, errorBody);
    throw new Error(`GitHub API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data;
}

async function fetchProjectBoardData(): Promise<Map<number, string>> {
  // GraphQL query to get project board data
  const query = `
    query($owner: String!, $number: Int!) {
      organization(login: $owner) {
        projectV2(number: $number) {
          items(first: 100) {
            nodes {
              id
              content {
                ... on Issue {
                  number
                }
              }
              fieldValues(first: 10) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    field {
                      ... on ProjectV2SingleSelectField {
                        name
                      }
                    }
                    name
                  }
                  ... on ProjectV2ItemFieldTextValue {
                    field {
                      ... on ProjectV2Field {
                        name
                      }
                    }
                    text
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        owner: GITHUB_CONFIG.ORG,
        number: GITHUB_CONFIG.PROJECT_NUMBER,
      },
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('GraphQL error:', response.status, errorText);
    throw new Error(`GitHub GraphQL API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    console.error('GraphQL query errors:', data.errors);
    throw new Error('GraphQL query failed');
  }
  
  const statusMap = new Map<number, string>();

  if (data.data?.organization?.projectV2?.items?.nodes) {
    for (const item of data.data.organization.projectV2.items.nodes) {
      if (item.content?.number) {
        // Look for Status field
        const statusField = item.fieldValues.nodes.find(
          (field: any) => field.field?.name === 'Status'
        );
        
        if (statusField?.name) {
          statusMap.set(item.content.number, statusField.name);
        }
      }
    }
  }

  return statusMap;
}

export const GET: APIRoute = async () => {
  try {
    if (!GITHUB_TOKEN) {
      console.error('ERROR: GitHub token not configured');
      return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Try to load from file cache first (instant!)
    try {
      const cacheData = await readFile(CACHE_FILE, 'utf-8');
      const cached = JSON.parse(cacheData);
      const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime();
      
      // Use file cache if less than 10 minutes old
      if (cacheAge < CACHE_DURATION) {
        return new Response(JSON.stringify(cached.wishlists), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'X-Cache': 'FILE-HIT',
            'X-Cache-Age': Math.round(cacheAge / 1000).toString(),
            'Cache-Control': 'public, max-age=600'
          },
        });
      }
    } catch (error) {
      // No file cache available, will fetch from GitHub
    }

    // Check if we have valid in-memory cached data
    const now = Date.now();
    if (cachedWishlists && (now - cacheTimestamp) < CACHE_DURATION) {
      return new Response(JSON.stringify(cachedWishlists), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Cache': 'MEMORY-HIT',
          'Cache-Control': 'public, max-age=600'
        },
      });
    }

    // Fetch issues with timeout (5 seconds)
    const issuesPromise = Promise.race([
      fetchGitHubIssues(),
      new Promise<GitHubIssue[]>((_, reject) => {
        setTimeout(() => reject(new Error('GitHub Issues API timeout after 5s')), 5000);
      })
    ]);
    
    // Fetch project board with timeout (optional, can fail)
    const statusMapPromise = Promise.race([
      fetchProjectBoardData(),
      new Promise<Map<number, string>>((resolve) => {
        setTimeout(() => {
          console.warn('GraphQL timeout after 3s, continuing without status data');
          resolve(new Map());
        }, 3000); // 3 second timeout
      })
    ]).catch((error) => {
      console.warn('Project board fetch failed:', error.message);
      return new Map(); // Fallback if project board fails
    });
    
    const [issues, statusMap] = await Promise.all([
      issuesPromise,
      statusMapPromise
    ]);

    const wishlists = issues.map(issue => {
      // Use the new issue form parser
      const parsed = parseIssueForm(issue.body);
      const status = statusMap.get(issue.number) || 'Open';
      
      // Combine services and resources into wishes array
      const wishes = [...parsed.services, ...parsed.resources];
      
      return {
        id: issue.number,
        title: issue.title,
        url: issue.html_url,
        projectTitle: parsed.project || issue.title,
        maintainerName: parsed.maintainer || issue.user.login,
        wishes: wishes,
        urgency: parsed.urgency,
        status,
        labels: issue.labels,
        author: {
          login: issue.user.login,
          avatar_url: issue.user.avatar_url,
        },
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      };
    });

    // Update in-memory cache
    cachedWishlists = wishlists;
    cacheTimestamp = now;

    // Update file cache in background (don't wait for it)
    const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4324';
    const basePath = import.meta.env.PUBLIC_BASE_PATH || '/oss-wishlist-website';
    fetch(`${siteUrl}${basePath}/api/cache-wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishlists }),
    }).catch(() => {});

    return new Response(JSON.stringify(wishlists), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=600'
      },
    });
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch wishlists',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};