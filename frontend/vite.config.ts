import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
  plugins: [enhancedImages(), tailwindcss(), sveltekit()],
  server: {
    port: 1420,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      port: 1420
    }
  },
  preview: {
    port: 1420
  }
});
