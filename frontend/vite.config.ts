import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
  define: {
    __version__: JSON.stringify(process.env.npm_package_version)
  },
  plugins: [enhancedImages(), tailwindcss(), sveltekit()],
  resolve: process.env.VITEST
    ? {
        conditions: ['browser']
      }
    : undefined,
  server: {
    hmr: {
      port: 5174
    }
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    include: ['src/tests/unit/**/*.{test,spec}.{js,ts}'],
    setupFiles: [
      './src/tests/setup/vitest-setup.ts',
      './src/tests/setup/vitest-setup-sveltekit.ts',
      './src/tests/mocks/setup.ts'
    ]
  }
});
