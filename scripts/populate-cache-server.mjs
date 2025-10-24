#!/usr/bin/env node
/**
 * Populate cache on server after deployment
 * This script hits the wishlists API to generate the cache files
 */

const SITE_URL = process.env.PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:4321';
const BASE_PATH = process.env.PUBLIC_BASE_PATH || '/oss-wishlist-website';

async function populateCache() {
  const url = `${SITE_URL}${BASE_PATH}/api/wishlists?refresh=true`;
  
  console.log(`[Cache] Populating cache from: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OSS-Wishlist-Cache-Warmer'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[Cache] ✓ Successfully cached ${data.length || 0} wishlists`);
    process.exit(0);
  } catch (error) {
    console.error('[Cache] ✗ Failed to populate cache:', error.message);
    console.log('[Cache] Cache will be populated on first request');
    // Don't fail the build if cache warming fails
    process.exit(0);
  }
}

populateCache();
