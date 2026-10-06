import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rolldownOptions: {
      // `vue` is a peer dependency and must never be bundled.
      external: ['vue'],
    },
  },
  test: {
    environment: 'jsdom',
  },
})
