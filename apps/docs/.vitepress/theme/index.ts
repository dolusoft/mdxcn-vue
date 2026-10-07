import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { Faq, GraphBoard, GraphCompare, GraphMatrix, GraphHeatmap, Col, GraphGantt, GraphDiff, GraphWaterfall, Span, Line, Delta, GraphStat, GraphSlope, GraphBullet, Stat, Slope, Target, GraphScore, GraphRank, GraphFunnel, Rank, Stage, GraphTimeline, Event, GraphSpec, Field, Chat, Keys, Steps, Step, Changelog, Change, Decision, Annotate, Env, Bar, Callout, Quote, Terminal, Endpoint, GraphStack, GraphTable, GraphTimer, Head, Row, Foot, Cell, Segment } from 'mdxcn-vue'
import './style.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/600.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('GraphTimeline', GraphTimeline)
    app.component('Event', Event)
    app.component('GraphSpec', GraphSpec)
    for (const [name, component] of Object.entries({ Faq, GraphBoard, GraphCompare, GraphMatrix, GraphHeatmap, Col, GraphGantt, GraphDiff, GraphWaterfall, Span, Line, Delta, GraphStat, GraphSlope, GraphBullet, Stat, Slope, Target, GraphScore, GraphRank, GraphFunnel, Rank, Stage })) app.component(name, component)
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
    app.component('Callout', Callout)
    app.component('Quote', Quote)
    app.component('Terminal', Terminal)
    app.component('GraphStack', GraphStack)
    app.component('Bar', Bar)
    app.component('Segment', Segment)
    app.component('GraphTable', GraphTable)
    app.component('Endpoint', Endpoint)
    app.component('GraphTimer', GraphTimer)
    app.component('Head', Head)
    app.component('Row', Row)
    app.component('Foot', Foot)
    app.component('Cell', Cell)
  },
} satisfies Theme
