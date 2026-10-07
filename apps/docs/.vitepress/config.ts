import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import vueDevTools from 'vite-plugin-vue-devtools'
import { mdxcnMarkdown, withMdxcn } from 'mdxcn-markdown'

// Vite DevTools is configured in `../vite.config.ts` (see the note there).
const base = process.env.MDXCN_PAGES === 'true' ? '/mdxcn-vue/' : '/'

export default defineConfig({
  base,
  title: 'mdxcn-vue',
  description: 'Vue 3 port of mdxcn',
  // Applies the stored graph accent before first paint (see 	heme/accent.ts).
  head: [
    [
      'script',
      { id: 'check-graph-accent' },
      `try{document.documentElement.dataset.accent=localStorage.getItem('graph-accent')||'ocean'}catch{document.documentElement.dataset.accent='ocean'}`,
    ],
  ],
  transformHead: ({ assets }) => assets
    .filter(asset => /geist-mono-latin-(?:400|600)-normal.*\.woff2$/.test(asset))
    .map(asset => ['link', {rel:'preload',as:'font',type:'font/woff2',crossorigin:'',href:asset}]),
  markdown: { config: (md) => {
    md.use(mdxcnMarkdown, { renderLinks: true })
    md.use(withMdxcn, { components: ['Callout', 'Quote', 'Terminal', 'Footnotes'] })
  } },
  themeConfig: {
    nav: [{ text: 'components', link: '/docs/graph-stack' }, { text: 'comark', link: '/docs/comark' }, { text: 'knap', link: '/docs/knap' }],
    socialLinks: [{ icon: 'github', link: 'https://github.com/dolusoft/mdxcn-vue' }],
    search: { provider: 'local' },
    sidebar: [{ text: 'get started', items: [{ text: 'mdx', link: '/docs/mdx' }, { text: 'comark', link: '/docs/comark' }, { text: 'knap', link: '/docs/knap' }] }, { text: 'components', items: [{ text: 'callout', link: '/docs/callout' }, { text: 'quote', link: '/docs/quote' }, { text: 'steps', link: '/docs/steps' }, { text: 'terminal', link: '/docs/terminal' }, { text: 'changelog', link: '/docs/changelog' }, { text: 'annotate', link: '/docs/annotate' }, { text: 'decision', link: '/docs/decision' }, { text: 'chat', link: '/docs/chat' }, { text: 'env', link: '/docs/env' }, { text: 'endpoint', link: '/docs/endpoint' }, { text: 'keys', link: '/docs/keys' }, { text: 'faq', link: '/docs/faq' }, { text: 'table', link: '/docs/graph-table' }, { text: 'sheet', link: '/docs/graph-sheet' }, { text: 'flow', link: '/docs/graph-flow' }, { text: 'bars', link: '/docs/graph-bars' }, { text: 'rank', link: '/docs/graph-rank' }, { text: 'cells', link: '/docs/graph-cells' }, { text: 'meter', link: '/docs/graph-meter' }, { text: 'spark', link: '/docs/graph-spark' }, { text: 'tree', link: '/docs/graph-tree' }, { text: 'timeline', link: '/docs/graph-timeline' }, { text: 'check', link: '/docs/graph-check' }, { text: 'stack', link: '/docs/graph-stack' }, { text: 'funnel', link: '/docs/graph-funnel' }, { text: 'gantt', link: '/docs/graph-gantt' }, { text: 'plot', link: '/docs/graph-plot' }, { text: 'waffle', link: '/docs/graph-waffle' }, { text: 'diff', link: '/docs/graph-diff' }, { text: 'invoice', link: '/docs/graph-invoice' }, { text: 'compare', link: '/docs/graph-compare' }, { text: 'matrix', link: '/docs/graph-matrix' }, { text: 'stat', link: '/docs/graph-stat' }, { text: 'kpi', link: '/docs/graph-kpi' }, { text: 'spec', link: '/docs/graph-spec' }, { text: 'activity', link: '/docs/graph-activity' }, { text: 'heatmap', link: '/docs/graph-heatmap' }, { text: 'calendar', link: '/docs/graph-calendar' }, { text: 'waterfall', link: '/docs/graph-waterfall' }, { text: 'uptime', link: '/docs/graph-uptime' }, { text: 'slope', link: '/docs/graph-slope' }, { text: 'board', link: '/docs/graph-board' }, { text: 'score', link: '/docs/graph-score' }, { text: 'bullet', link: '/docs/graph-bullet' }, { text: 'timer', link: '/docs/graph-timer' }, { text: 'countdown', link: '/docs/graph-countdown' }] }],
  },
  vite: {
    // Vue DevTools: in-page overlay plus standalone UI at `/__devtools__/`.
    plugins: [tailwindcss(), vueDevTools()],
    // Default theme parts swapped for shadcn-based ones: the sidebar scrolls in a
    // ScrollArea, and the search box is a Dialog + Command.
    resolve: {
      alias: [
        {
          find: /^.*\/VPLocalSearchBox\.vue$/,
          replacement: fileURLToPath(new URL('./theme/site/SiteSearch.vue', import.meta.url)),
        },
        {
          find: /^.*\/VPSidebar\.vue$/,
          replacement: fileURLToPath(new URL('./theme/site/SiteSidebar.vue', import.meta.url)),
        },
      ],
    },
  },
})
