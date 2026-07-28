import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    lightningcss: false,
  },
  server: {
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
  },
});