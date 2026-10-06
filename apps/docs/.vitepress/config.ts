import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import vueDevTools from 'vite-plugin-vue-devtools'
import { mdxcnMarkdown, withMdxcn } from 'mdxcn-markdown'

// Vite DevTools is configured in `../vite.config.ts` (see the note there).
export default defineConfig({
  title: 'mdxcn-vue',
  description: 'Vue 3 port of mdxcn',
  transformHead: ({ assets }) => assets
    .filter(asset => /geist-mono-latin-(?:400|600)-normal.*\.woff2$/.test(asset))
    .map(asset => ['link', {rel:'preload',as:'font',type:'font/woff2',crossorigin:'',href:asset}]),
  markdown: { config: (md) => {
    md.use(mdxcnMarkdown, { renderLinks: true })
    md.use(withMdxcn, { components: ['Callout', 'Quote', 'Terminal'] })
  } },
  themeConfig: {
    sidebar: [{ text: 'Components', items: [{ text: 'GraphStack', link: '/components/graph-stack' }, { text: 'GraphTable', link: '/components/graph-table' }, { text: 'Endpoint', link: '/components/endpoint' }, { text: 'GraphTimer', link: '/components/graph-timer' }, { text: 'Callout', link: '/components/callout' }, { text: 'Quote', link: '/components/quote' }, { text: 'Terminal', link: '/components/terminal' }, { text: 'Annotate', link: '/components/annotate' }, { text: 'Env', link: '/components/env' }] }],
  },
  vite: {
    // Vue DevTools: in-page overlay plus standalone UI at `/__devtools__/`.
    plugins: [tailwindcss(), vueDevTools()],
  },
})
