// Public API endpoint for external data consumption (e.g., ecosystem.ms)
// Simple JSON endpoint that serves the cached wishlist data with CORS headers

import type { APIRoute } from 'astro';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const prerender = false;

const CACHE_FILE = join(process.cwd(), 'public', 'wishlist-cache', 'all-wishlists.json');

export const GET: APIRoute = async () => {
  try {
    const cacheData = await readFile(CACHE_FILE, 'utf-8');
    const data = JSON.parse(cacheData);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=600', // 10 minutes
      },
    });
  } catch (error) {
    console.error('Error reading wishlist cache:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to load wishlist data',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
