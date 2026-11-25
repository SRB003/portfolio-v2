import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// two pages: the home experience and /projects/ (every shipped project, from data.js)
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        projects: resolve(import.meta.dirname, 'projects/index.html'),
      },
    },
  },
})
