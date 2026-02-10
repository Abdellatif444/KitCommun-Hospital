import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    watch: {
      usePolling: true, // Required for Docker on Windows
      interval: 1000,   // Check every second
    },
    proxy: {
      '/audit': {
        target: 'http://localhost:8083', // Audit Service
        changeOrigin: true,
      },
      //   '/api': {
      //     target: 'http://localhost:8080', // Gateway (si besoin plus tard)
      //     changeOrigin: true,
      //   }
    }
  }
})
