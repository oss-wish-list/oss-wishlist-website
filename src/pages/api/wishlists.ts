// API endpoint to fetch wishlists from GitHub issues
// 
// Repository configuration is in /src/config/github.ts
//
import type { APIRoute } from 'astro';
import { GITHUB_CONFIG } from '../../config/github.js';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

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
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
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
    throw new Error(`GitHub GraphQL API error: ${response.status}`);
  }

  const data = await response.json();
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

function parseIssueBody(body: string) {
  // Parse clean issue format (like issue #5)
  console.log('Raw issue body:', body);
  
  let projectTitle = '';
  let maintainerName = '';
  let wishes: string[] = [];
  let urgency = 'medium';

  const lines = body.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Parse simple **field:** format
    if (line.startsWith('**Project:**')) {
      projectTitle = line.replace('**Project:**', '').trim();
    } else if (line.startsWith('**Maintainer:**')) {
      maintainerName = line.replace('**Maintainer:**', '').replace('@', '').trim();
    } else if (line.startsWith('**Urgency:**')) {
      urgency = line.replace('**Urgency:**', '').toLowerCase().trim();
    } else if (line === '## Services Requested') {
      // Parse the services list that follows
      i++;
      while (i < lines.length) {
        const serviceLine = lines[i].trim();
        
        // Stop if we hit another section
        if (serviceLine.startsWith('#') || serviceLine.startsWith('**') || serviceLine.startsWith('---')) {
          break;
        }
        
        // Parse service items (both - Service and - [ ] Service formats)
        if (serviceLine.startsWith('- ')) {
          const service = serviceLine
            .replace(/^-\s*(\[\s*[x\s]?\s*\])?\s*/, '') // Remove - or - [ ] or - [x]
            .trim();
          if (service) {
            wishes.push(service);
          }
        }
        
        i++;
      }
      // Step back one since the outer loop will increment
      i--;
    }
  }

  console.log('Parsed data:', { projectTitle, maintainerName, wishes, urgency });
  return { projectTitle, maintainerName, wishes, urgency };
}

export const GET: APIRoute = async () => {
  try {
    console.log('GitHub token available:', !!GITHUB_TOKEN);
    
    if (!GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [issues, statusMap] = await Promise.all([
      fetchGitHubIssues(),
      fetchProjectBoardData().catch((error) => {
        console.warn('Project board fetch failed:', error);
        return new Map(); // Fallback if project board fails
      }),
    ]);

    console.log(`Fetched ${issues.length} issues`);
    console.log(`Status map size: ${statusMap.size}`);

    const wishlists = issues.map(issue => {
      const parsed = parseIssueBody(issue.body);
      const status = statusMap.get(issue.number) || 'Open';
      
      // Debug logging
      console.log(`Issue #${issue.number}:`);
      console.log(`  Parsed title: "${parsed.projectTitle}"`);
      console.log(`  Parsed maintainer: "${parsed.maintainerName}"`);
      console.log(`  Parsed wishes: [${parsed.wishes.join(', ')}]`);
      console.log(`  Urgency: ${parsed.urgency}`);
      
      return {
        id: issue.number,
        title: issue.title,
        url: issue.html_url,
        projectTitle: parsed.projectTitle || issue.title,
        maintainerName: parsed.maintainerName || issue.user.login,
        wishes: parsed.wishes,
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

    return new Response(JSON.stringify(wishlists), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
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