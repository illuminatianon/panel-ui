import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Use source during development
      'panel-ui': '../panel-ui/src'
    }
  }
})
