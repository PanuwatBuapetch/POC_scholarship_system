import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://server:5000', // ชี้ไปหาชื่อ service 'server' ใน docker-compose.yml
        changeOrigin: true,
      },
    },
  },
})