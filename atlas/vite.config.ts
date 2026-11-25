import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relativa: o build funciona em qualquer servidor estático ou subpasta
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 4000 },
})
