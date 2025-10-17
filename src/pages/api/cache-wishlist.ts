// API endpoint to cache wishlist data when created/updated
import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { GITHUB_CONFIG } from '../../config/github.js';
import { parseIssueForm } from '../../lib/issue-form-parser.js';

export const prerender = false;

const CACHE_DIR = join(process.cwd(), 'public', 'wishlist-cache');

interface WishlistData {
  id: number;
  title: string;
  url: string;
  projectTitle: string;
  maintainerName: string;
  wishes: string[];
  urgency: string;
  status: string;
  labels: Array<{ name: string; color: string }>;
  author: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  // Optional form fields
  timeline?: string;
  organizationType?: 'individual' | 'company' | 'nonprofit' | 'foundation';
  organizationName?: string;
  additionalNotes?: string;
}

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
}

// Save individual wishlist to cache
async function cacheWishlist(wishlist: WishlistData) {
  await ensureCacheDir();
  const filename = `wishlist-${wishlist.id}.json`;
  const filepath = join(CACHE_DIR, filename);
  
  try {
    await writeFile(filepath, JSON.stringify(wishlist, null, 2));
    return true;
  } catch (error) {
    console.error(`Error caching wishlist ${wishlist.id}:`, error);
    return false;
  }
}

// Update the master index file with all wishlists
async function updateMasterIndex(wishlists: WishlistData[]) {
  await ensureCacheDir();
  const filepath = join(CACHE_DIR, 'all-wishlists.json');
  
  try {
    await writeFile(filepath, JSON.stringify({
      wishlists,
      lastUpdated: new Date().toISOString(),
      count: wishlists.length
    }, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating master index:', error);
    return false;
  }
}

// Fetch and cache a single wishlist by issue number
async function fetchAndCacheWishlist(issueNumber: number): Promise<WishlistData | null> {
  try {
    const githubToken = import.meta.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GitHub token not configured');
      return null;
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.ORG}/${GITHUB_CONFIG.REPO}/issues/${issueNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch issue ${issueNumber}:`, response.statusText);
      return null;
    }

    const issue = await response.json();
    
    // Parse the issue body
    const parsed = parseIssueForm(issue.body || '');
    
    // Create wishlist data
    const wishlistData: WishlistData = {
      id: issue.number,
      title: issue.title,
      url: issue.html_url,
      projectTitle: parsed.project,
      maintainerName: parsed.maintainer || issue.user?.login || 'Unknown',
      wishes: parsed.services,
      urgency: parsed.urgency,
      status: issue.state === 'open' ? 'Open' : 'Closed',
      labels: issue.labels.map((label: any) => ({
        name: label.name,
        color: label.color
      })),
      author: {
        login: issue.user?.login || 'Unknown',
        avatar_url: issue.user?.avatar_url || ''
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      timeline: parsed.timeline,
      organizationType: parsed.organizationType,
      organizationName: parsed.organizationName,
      additionalNotes: parsed.additionalNotes
    };

    // Cache it
    await cacheWishlist(wishlistData);
    
    return wishlistData;
  } catch (error) {
    console.error(`Error fetching and caching wishlist ${issueNumber}:`, error);
    return null;
  }
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const issueNumber = url.searchParams.get('issueNumber');
    
    if (!issueNumber) {
      return new Response(JSON.stringify({ error: 'Issue number required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const wishlist = await fetchAndCacheWishlist(parseInt(issueNumber));
    
    if (!wishlist) {
      return new Response(JSON.stringify({ error: 'Failed to fetch wishlist' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, wishlist }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GET cache-wishlist:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    if (data.wishlist) {
      // Single wishlist update
      const success = await cacheWishlist(data.wishlist);
      return new Response(JSON.stringify({ success }), {
        status: success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (data.wishlists) {
      // Bulk update (all wishlists)
      await updateMasterIndex(data.wishlists);
      
      // Also cache individual files
      for (const wishlist of data.wishlists) {
        await cacheWishlist(wishlist);
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        count: data.wishlists.length 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in cache-wishlist:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to cache wishlist',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
