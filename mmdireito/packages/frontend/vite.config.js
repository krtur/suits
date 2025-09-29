import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path for assets
  base: './',
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy API requests to the backend server
      '/agent': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    
    // Configure multi-page app
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        documentAnalysis: resolve(__dirname, 'document-analysis.html'),
        settings: resolve(__dirname, 'settings.html'),
        about: resolve(__dirname, 'about.html')
      }
    }
  },
  
  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        // Import global variables and mixins in all SCSS files
        additionalData: `@import "./assets/scss/design-system/_variables.scss";`
      }
    },
    devSourcemap: true
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, './assets')
    }
  }
});
