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
    // Digital Ocean uses PORT env variable, fallback to 4324 for local dev
    port: process.env.PORT ? parseInt(process.env.PORT) : 4324,
    // Use localhost in dev for security, 0.0.0.0 in production for Docker/cloud deployments
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
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