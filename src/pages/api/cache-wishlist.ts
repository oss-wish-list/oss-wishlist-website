// API endpoint to cache wishlist data when created/updated
import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';
import { GITHUB_CONFIG } from '../../config/github.js';
import { parseIssueForm } from '../../lib/issue-form-parser.js';

export const prerender = false;

const CACHE_DIR = join(process.cwd(), 'public', 'wishlist-cache');

// Validation schema for wishlist data
const WishlistDataSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  url: z.string().url(),
  wishlistUrl: z.string().url().optional(), // Optional for backward compatibility
  projectTitle: z.string().min(1),
  maintainerName: z.string().min(1),
  wishes: z.array(z.string()).min(1),
  technologies: z.array(z.string()).optional(),
  urgency: z.enum(['low', 'medium', 'high']),
  status: z.enum(['Open', 'Closed']),
  labels: z.array(z.object({
    name: z.string(),
    color: z.string().regex(/^[0-9a-fA-F]{6}$/)
  })),
  author: z.object({
    login: z.string(),
    avatar_url: z.string().url()
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  timeline: z.string().optional(),
  organizationType: z.enum(['individual', 'company', 'nonprofit', 'foundation']).optional(),
  organizationName: z.string().optional(),
  additionalNotes: z.string().optional(),
});

interface WishlistData {
  id: number;
  title: string;
  url: string;
  wishlistUrl?: string; // Optional for backward compatibility
  projectTitle: string;
  maintainerName: string;
  wishes: string[];
  technologies?: string[];
  urgency: 'low' | 'medium' | 'high';
  status: 'Open' | 'Closed';
  labels: Array<{ name: string; color: string }>;
  author: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
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
    // Validate data before caching
    const validatedWishlist = WishlistDataSchema.parse(wishlist);
    
    await writeFile(filepath, JSON.stringify(validatedWishlist, null, 2));
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Validation error for wishlist ${wishlist.id}:`, error.errors);
    } else {
      console.error(`Error caching wishlist ${wishlist.id}:`, error);
    }
    return false;
  }
}

// Update the master index file with all wishlists
async function updateMasterIndex(wishlists: WishlistData[]) {
  await ensureCacheDir();
  const filepath = join(CACHE_DIR, 'all-wishlists.json');
  
  try {
    await writeFile(filepath, JSON.stringify({
      schema_version: '1.0.0',
      generated_by: 'OSS Wishlist Platform',
      data_source: 'GitHub Issues (oss-wishlist/wishlists)',
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
    
    // Fetch comments to get the most recent update
    const commentsResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.ORG}/${GITHUB_CONFIG.REPO}/issues/${issueNumber}/comments`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    let bodyToParse = issue.body || '';
    
    if (commentsResponse.ok) {
      const comments = await commentsResponse.json();
      
      // Find the most recent "Wishlist Updated" comment
      const updateComments = comments.filter((comment: any) => 
        comment.body && comment.body.includes('📝 Wishlist Updated')
      );
      
      if (updateComments.length > 0) {
        // Get the most recent update comment
        const latestUpdate = updateComments[updateComments.length - 1];
        
        // Extract the wishlist data from the comment body
        // The comment format is: "## 📝 Wishlist Updated\n\nThe wishlist has been updated with the following information:\n\n{actualData}"
        const updateMatch = latestUpdate.body.match(/following information:\s*\n\n([\s\S]+?)\n\n---/);
        if (updateMatch && updateMatch[1]) {
          bodyToParse = updateMatch[1];
        }
      }
    }
    
    // Parse the most recent body (either from latest update comment or original issue)
    const parsed = parseIssueForm(bodyToParse);
    
    // Build the wishlist URL (platform URL, not GitHub)
    const basePath = import.meta.env.BASE_URL || '';
    const origin = import.meta.env.SITE_URL || 'http://localhost:4324';
    const wishlistUrl = `${origin}${basePath}/fulfill?issue=${issue.number}`;
    
    // Normalize urgency to valid enum value
    const normalizeUrgency = (urgency: string): 'low' | 'medium' | 'high' => {
      const normalized = urgency.toLowerCase();
      if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
        return normalized as 'low' | 'medium' | 'high';
      }
      return 'medium'; // Default fallback
    };
    
    // Create wishlist data
    const wishlistData: WishlistData = {
      id: issue.number,
      title: issue.title,
      url: issue.html_url,
      wishlistUrl: wishlistUrl,
      projectTitle: parsed.project,
      maintainerName: parsed.maintainer || issue.user?.login || 'Unknown',
      wishes: parsed.services,
      technologies: parsed.technologies,
      urgency: normalizeUrgency(parsed.urgency),
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
