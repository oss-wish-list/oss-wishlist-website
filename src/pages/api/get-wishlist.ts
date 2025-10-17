import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { join } from 'path';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const issueNumber = url.searchParams.get('issueNumber');
    
    if (!issueNumber) {
      return new Response(JSON.stringify({ error: 'Issue number is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Read the cached wishlist file
    const cachePath = join(process.cwd(), 'public', 'wishlist-cache', `wishlist-${issueNumber}.json`);
    
    try {
      const fileContent = readFileSync(cachePath, 'utf-8');
      const wishlistData = JSON.parse(fileContent);
      
      return new Response(JSON.stringify(wishlistData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (fileErr) {
      console.error('Error reading cache file:', fileErr);
      return new Response(JSON.stringify({ error: 'Wishlist not found in cache' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('Error in get-wishlist API:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
