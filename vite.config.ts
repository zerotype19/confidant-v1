import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/api/index.ts'),
      },
      output: {
        dir: 'dist',
        format: 'es',
      },
      external: [
        '@hono/oauth-providers/google',
        'bcryptjs',
        'jsonwebtoken',
        'hono',
        '@hono/zod-validator',
        'zod',
      ],
    },
    target: 'esnext',
    minify: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env': process.env,
  },
}) 