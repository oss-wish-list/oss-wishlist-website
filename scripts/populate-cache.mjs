// Script to manually populate the wishlist cache
// Run this with: node scripts/populate-cache.mjs

const WISHLISTS_API = process.env.ASTRO_SITE 
  ? `${process.env.ASTRO_SITE}/api/wishlists`
  : 'http://localhost:4324/oss-wishlist-website/api/wishlists';

console.log('Fetching wishlists to populate cache...');
console.log('API URL:', WISHLISTS_API);

try {
  const response = await fetch(WISHLISTS_API);
  const data = await response.json();
  
  console.log(`✅ Cache populated with ${data.length} wishlists`);
  console.log('Cache headers:', {
    cache: response.headers.get('X-Cache'),
    cacheAge: response.headers.get('X-Cache-Age'),
    fetchTime: response.headers.get('X-Fetch-Time')
  });
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error populating cache:', error.message);
  process.exit(1);
}
