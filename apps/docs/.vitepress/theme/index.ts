import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { Bar, GraphStack, MdxcnSmoke, Segment } from 'mdxcn-vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MdxcnSmoke', MdxcnSmoke)
    app.component('GraphStack', GraphStack)
    app.component('Bar', Bar)
    app.component('Segment', Segment)
  },
} satisfies Theme
