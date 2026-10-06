import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { Bar, Endpoint, GraphStack, GraphTable, GraphTimer, Head, Row, Foot, Cell, MdxcnSmoke, Segment } from 'mdxcn-vue'
import './style.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/600.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MdxcnSmoke', MdxcnSmoke)
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
