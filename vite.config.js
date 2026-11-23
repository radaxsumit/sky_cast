import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import weatherProxy from './vite-plugin-weather-proxy.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_*) for the server-side dev proxy only.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/',
    plugins: [react(), tailwindcss(), weatherProxy(env)],
    build: {
      // Keep the 120+ animated weather icons as separate files so only the ones on screen are downloaded.
      assetsInlineLimit: (file) => (file.includes('weather-icons') ? false : undefined),
    },
  };
});
