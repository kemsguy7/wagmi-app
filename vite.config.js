// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure correct MIME types for deployment
    rollupOptions: {
      output: {
        // Properly handle code-splitting
        manualChunks: {
          vendor: ['react', 'react-dom', 'wagmi', '@tanstack/react-query'],
          wallet: ['viem'],
        },
      },
    },
    // Ensure correct asset handling
    assetsInlineLimit: 0,
  },
  // Resolve relative paths correctly
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Configure base URL for production
  base: '/',
});
