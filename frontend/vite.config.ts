import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Prefix for all public environment variables
  envPrefix: 'SAFE_',
  server: {
    port: 3000,
  },
});
