import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import vueDevTools from 'vite-plugin-vue-devtools'

// Vite DevTools is configured in `../vite.config.ts` (see the note there).
export default defineConfig({
  title: 'mdxcn-vue',
  description: 'Vue 3 port of mdxcn',
  vite: {
    // Vue DevTools: in-page overlay plus standalone UI at `/__devtools__/`.
    plugins: [tailwindcss(), vueDevTools()],
  },
})
