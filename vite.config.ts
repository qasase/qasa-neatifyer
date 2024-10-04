import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/production/predict': {
        target: 'https://model-232lr5vw.api.baseten.co/',
        changeOrigin: true,
        secure: false,
      },
      
    },
  },
  plugins: [react()],
})
