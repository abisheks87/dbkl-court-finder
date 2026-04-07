import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Optional CORS proxy - uncomment if you get CORS errors
    // proxy: {
    //   '/api': {
    //     target: 'https://apihub.dbkl.gov.my',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '/api/public/v1'),
    //   },
    // },
  },
})
