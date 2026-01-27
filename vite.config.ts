import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Specifically set process.env.API_KEY for the Gemini SDK
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Also provide a fallback for general process.env checks
    'process.env': {
      API_KEY: process.env.API_KEY
    }
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