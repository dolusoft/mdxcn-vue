import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'mdxcn-css-entries',
      generateBundle() {
        for (const entry of ['graph', 'host', 'theme']) {
          const source = readFileSync(
            new URL(`./src/styles/${entry}.css`, import.meta.url),
            'utf8',
          ).replace(/@source\s+['"]\.\.\/['"]/, '@source "./"')
          this.emitFile({ type: 'asset', fileName: `${entry}.css`, source })
        }
      },
    },
  ],
  build: {
    lib: {
      entry: { index: 'src/index.ts', core: 'src/core/index.ts' },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    rolldownOptions: {
      // `vue` is a peer dependency and must never be bundled.
      external: ['vue'],
    },
  },
  test: {
    environment: 'jsdom',
    env: { TZ: 'UTC' },
  },
})
