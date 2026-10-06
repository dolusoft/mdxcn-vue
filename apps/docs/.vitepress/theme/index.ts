import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { MdxcnSmoke } from 'mdxcn-vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MdxcnSmoke', MdxcnSmoke)
  },
} satisfies Theme
