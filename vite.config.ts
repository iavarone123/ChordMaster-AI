import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Only define the specific key string to avoid breaking process.env for other libraries
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    minify: 'esbuild'
  },
  server: {
    port: 3000
  }
});