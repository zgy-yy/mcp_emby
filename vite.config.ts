import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5322,
    host: '0.0.0.0',
    proxy: {
      '/mcp': {
        target: 'http://127.0.0.1:5321',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
