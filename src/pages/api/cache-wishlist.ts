// API endpoint to cache wishlist data when created/updated
import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
