import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content/index.ts'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  },
  test: {
    include: ['src/tests/**/*.test.ts'],
    watch: false,
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
})
