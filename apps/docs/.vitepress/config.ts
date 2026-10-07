import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import vueDevTools from 'vite-plugin-vue-devtools'
import { mdxcnMarkdown, withMdxcn } from 'mdxcn-markdown'

// Vite DevTools is configured in `../vite.config.ts` (see the note there).
const base = process.env.MDXCN_PAGES === 'true' ? '/mdxcn-vue/' : '/'

export default defineConfig({
  base,
  title: 'mdxcn-vue',
  description: 'Vue 3 port of mdxcn',
  transformHead: ({ assets }) => assets
    .filter(asset => /geist-mono-latin-(?:400|600)-normal.*\.woff2$/.test(asset))
    .map(asset => ['link', {rel:'preload',as:'font',type:'font/woff2',crossorigin:'',href:asset}]),
  markdown: { config: (md) => {
    md.use(mdxcnMarkdown, { renderLinks: true })
    md.use(withMdxcn, { components: ['Callout', 'Quote', 'Terminal', 'Footnotes'] })
  } },
  themeConfig: {
    nav: [{ text: 'components', link: '/components/graph-stack' }, { text: 'comark', link: '/docs/comark' }, { text: 'knap', link: '/docs/knap' }],
    socialLinks: [{ icon: 'github', link: 'https://github.com/dolusoft/mdxcn-vue' }],
    sidebar: [{ text: 'Components', items: [{text:'GraphUptime',link:'/components/graph-uptime'},{text:'GraphCountdown',link:'/components/graph-countdown'},{text:'GraphActivity',link:'/components/graph-activity'},{text:'GraphCalendar',link:'/components/graph-calendar'},{text:'GraphCells',link:'/components/graph-cells'},{text:'GraphMeter',link:'/components/graph-meter'},{text:'GraphWaffle',link:'/components/graph-waffle'},{text:'GraphBars',link:'/components/graph-bars'},{text:'GraphSpark',link:'/components/graph-spark'},{text:'GraphPlot',link:'/components/graph-plot'},{text:'GraphKpi',link:'/components/graph-kpi'},{text:'GraphTree',link:'/components/graph-tree'},{text:'GraphCheck',link:'/components/graph-check'},{text:'GraphFlow',link:'/components/graph-flow'},{text:'GraphSheet',link:'/components/graph-sheet'},{text:'GraphInvoice',link:'/components/graph-invoice'},{ text: 'Faq', link: '/components/faq' }, { text: 'GraphBoard', link: '/components/graph-board' }, { text: 'GraphCompare', link: '/components/graph-compare' }, { text: 'GraphMatrix', link: '/components/graph-matrix' }, { text: 'GraphHeatmap', link: '/components/graph-heatmap' }, { text: 'GraphStack', link: '/components/graph-stack' }, { text: 'GraphTable', link: '/components/graph-table' }, { text: 'Endpoint', link: '/components/endpoint' }, { text: 'GraphTimer', link: '/components/graph-timer' }, { text: 'Callout', link: '/components/callout' }, { text: 'Quote', link: '/components/quote' }, { text: 'Terminal', link: '/components/terminal' }, { text: 'Annotate', link: '/components/annotate' }, { text: 'Env', link: '/components/env' }, { text: 'Steps', link: '/components/steps' }, { text: 'Changelog', link: '/components/changelog' }, { text: 'Decision', link: '/components/decision' }, { text: 'Chat', link: '/components/chat' }, { text: 'Keys', link: '/components/keys' }, { text: 'GraphTimeline', link: '/components/graph-timeline' }, { text: 'GraphSpec', link: '/components/graph-spec' }, { text: 'GraphScore', link: '/components/graph-score' }, { text: 'GraphRank', link: '/components/graph-rank' }, { text: 'GraphFunnel', link: '/components/graph-funnel' }, { text: 'GraphStat', link: '/components/graph-stat' }, { text: 'GraphSlope', link: '/components/graph-slope' }, { text: 'GraphBullet', link: '/components/graph-bullet' }, { text: 'GraphGantt', link: '/components/graph-gantt' }, { text: 'GraphDiff', link: '/components/graph-diff' }, { text: 'GraphWaterfall', link: '/components/graph-waterfall' }] }],
  },
  vite: {
    // Vue DevTools: in-page overlay plus standalone UI at `/__devtools__/`.
    plugins: [tailwindcss(), vueDevTools()],
  },
})
