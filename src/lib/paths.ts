/**
 * Centralized path utilities for consistent URL handling across the application
 * Handles base path configuration for different deployment environments
 */

/**
 * Get the base path with trailing slash
 * Works in both server and client contexts
 */
export function getBasePath(): string {
  // In Astro, import.meta.env.BASE_URL may or may not have trailing slash
  // Normalize it to always have trailing slash for consistent usage
  const basePath = import.meta.env.BASE_URL || '/';
  return basePath.endsWith('/') ? basePath : `${basePath}/`;
}

/**
 * Get the base path without trailing slash
 * Useful for root navigation
 */
export function getBasePathNoSlash(): string {
  const basePath = getBasePath();
  return basePath === '/' ? '' : basePath.slice(0, -1);
}

/**
 * Construct a path with the base path prefix
 * @param path - The path to append (with or without leading slash)
 * @returns Full path with base path prefix
 * 
 * @example
 * // With base path '/oss-wishlist-website/'
 * withBasePath('maintainers') // => '/oss-wishlist-website/maintainers'
 * withBasePath('/about') // => '/oss-wishlist-website/about'
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${basePath}${cleanPath}`;
}

/**
 * Construct a full URL with base path
 * @param path - The path to append
 * @param origin - The origin (defaults to window.location.origin in browser)
 */
export function withBaseUrl(path: string, origin?: string): string {
  const actualOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${actualOrigin}${withBasePath(path)}`;
}
