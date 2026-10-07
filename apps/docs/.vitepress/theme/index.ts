import type { Theme } from 'vitepress'
// The site sets in Geist, so the default theme's Inter is never downloaded.
import DefaultTheme from 'vitepress/theme-without-fonts'
import { Footnotes, GraphUptime,GraphCountdown,GraphActivity,GraphCalendar,GraphCells,GraphMeter,GraphWaffle,Grid,GraphBars,GraphSpark,GraphPlot,GraphKpi,Series,GraphTree,GraphCheck,GraphFlow,Node,Task,GraphSheet, GraphInvoice, From, To, Item, Total, Faq, GraphBoard, GraphCompare, GraphMatrix, GraphHeatmap, GraphGantt, GraphDiff, GraphWaterfall, Delta, GraphStat, GraphSlope, GraphBullet, Stat, Slope, Target, GraphScore, GraphRank, GraphFunnel, Rank, Stage, GraphTimeline, Event, GraphSpec, Field, Chat, Keys, Steps, Step, Changelog, Change, Decision, Annotate, Env, Bar, Callout, Quote, Terminal, Endpoint, GraphStack, GraphTable, GraphTimer, Row, Foot, Cell, Segment } from 'mdxcn-vue'
import SiteLayout from './SiteLayout.vue'
import './style.css'
import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/600.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/600.css'

export default {
  extends: DefaultTheme,
  Layout: SiteLayout,
  enhanceApp({ app }) {
    app.component('GraphTimeline', GraphTimeline)
    app.component('Event', Event)
    app.component('GraphSpec', GraphSpec)
    for (const [name, component] of Object.entries({ GraphUptime,GraphCountdown,GraphActivity,GraphCalendar,GraphCells,GraphMeter,GraphWaffle,Grid,GraphBars,GraphSpark,GraphPlot,GraphKpi,Series,GraphTree,GraphCheck,GraphFlow,Node,Task,GraphSheet, GraphInvoice, From, To, Item, Total, Faq, GraphBoard, GraphCompare, GraphMatrix, GraphHeatmap, GraphGantt, GraphDiff, GraphWaterfall, Delta, GraphStat, GraphSlope, GraphBullet, Stat, Slope, Target, GraphScore, GraphRank, GraphFunnel, Rank, Stage })) app.component(name, component)
    app.component('Field', Field)
    app.component('Chat', Chat)
    app.component('Keys', Keys)
    app.component('Steps', Steps)
    app.component('Step', Step)
    app.component('Changelog', Changelog)
    app.component('Change', Change)
    app.component('Decision', Decision)
    app.component('Annotate', Annotate)
    app.component('Env', Env)
    app.component('Footnotes', Footnotes)
    app.component('Callout', Callout)
    app.component('Quote', Quote)
    app.component('Terminal', Terminal)
    app.component('GraphStack', GraphStack)
    app.component('Bar', Bar)
    app.component('Segment', Segment)
    app.component('GraphTable', GraphTable)
    app.component('Endpoint', Endpoint)
    app.component('GraphTimer', GraphTimer)
    app.component('Row', Row)
    app.component('Foot', Foot)
    app.component('Cell', Cell)
  },
} satisfies Theme
