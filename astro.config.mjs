import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://oss-wish-list.github.io',
  base: '/oss-wishlist-website', // Uncomment for GitHub Pages, comment out for Digital Ocean
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    port: 4324,
    host: 'localhost' // Restrict to localhost in development for security
  },
  vite: {
    ssr: {
      noExternal: ['@astrojs/react']
    }
  },
  integrations: [tailwind(), react()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});