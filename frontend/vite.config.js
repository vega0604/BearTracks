import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

const manifestJSON = {
  manifest: {
    // caches the assets/icons mentioned (assets/* includes all the assets present in your src/ directory) 
    name: 'Bear Tracks',
    short_name: 'BearTracks',
    start_url: '/',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/light_logo.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/dark_logo.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  workbox: {
    // defining cached files formats
    globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
    navigateFallback: 'index.html', // Fallback to index.html for unmatched routes
  },
  registerType: 'autoUpdate',
  strategies: 'generateSW'
};

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), jsconfigPaths(), VitePWA(manifestJSON)],
  build: {
    rollupOptions: {
      input: 'index.html', // Ensure this points to your entry HTML file
    },
  },
  server: {
    fs: {
      strict: false, // Adjust this if accessing files outside the root directory
    },
  },
  preview: {
    // Ensure the SPA fallback works in preview
    middlewareMode: 'html',
  },
})
