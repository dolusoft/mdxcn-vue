import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import vueDevTools from 'vite-plugin-vue-devtools'
import { mdxcnMarkdown } from 'mdxcn-markdown'

// Vite DevTools is configured in `../vite.config.ts` (see the note there).
export default defineConfig({
  title: 'mdxcn-vue',
  description: 'Vue 3 port of mdxcn',
  markdown: { config: (md) => { md.use(mdxcnMarkdown, { renderLinks: true }) } },
  themeConfig: {
    sidebar: [{ text: 'Components', items: [{ text: 'GraphStack', link: '/components/graph-stack' }, { text: 'GraphTable', link: '/components/graph-table' }, { text: 'Endpoint', link: '/components/endpoint' }, { text: 'GraphTimer', link: '/components/graph-timer' }] }],
  },
  vite: {
    // Vue DevTools: in-page overlay plus standalone UI at `/__devtools__/`.
    plugins: [tailwindcss(), vueDevTools()],
  },
})
