import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' 
import jsconfigPaths from 'vite-jsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

const manifestJSON = {
  manifest: {
    // caches the assets/icons mentioned (assets/* includes all the assets present in your src/ directory) 
    name: 'Bear Tracks',
    short_name: 'BearTracks',
    start_url: '/',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      // {
      //   src: '/images/icon-192x192.png',
      //   sizes: '192x192',
      //   type: 'image/png'
      // },
      // {
      //   src: '/images/icon-512x512.png',
      //   sizes: '512x512',
      //   type: 'image/png'
      // }
    ]
  },
  workbox: {
    // defining cached files formats
    globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jsconfigPaths(), VitePWA(manifestJSON)],
})
