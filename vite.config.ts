import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Ensure proper module loading for better SEO
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
