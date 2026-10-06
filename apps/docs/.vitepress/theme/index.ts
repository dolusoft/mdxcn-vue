import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { Annotate, Env, Bar, Callout, Quote, Terminal, Endpoint, GraphStack, GraphTable, GraphTimer, Head, Row, Foot, Cell, Segment } from 'mdxcn-vue'
import './style.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/600.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
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
