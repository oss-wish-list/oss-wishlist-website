import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://oss-wish-list.github.io',
  base: '/oss-wishlist-website',
  output: 'server',
  server: {
    port: 4324,
    host: true
  },
  integrations: [tailwind(), react()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});