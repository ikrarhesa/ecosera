import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import json from '@rollup/plugin-json'

export default defineConfig({
  plugins: [react(), json()], // Adding JSON plugin for production build
  build: {
    rollupOptions: {
      input: 'src/index.tsx', // Ensure this is correct
    },
  },
  server: {
    fs: {
      allow: ['src', 'public'], // Make sure src is allowed in the dev environment
    },
  },
})
