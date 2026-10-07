import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { numericSetup } from './numeric-list.js'
import type { GraphScoreProps } from './numeric-list.js'
export type { GraphScoreProps } from './numeric-list.js'
export const GraphScore = /* @__PURE__ */ defineComponent({
  name: 'GraphScore',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    items: Array as PropType<GraphScoreProps['items']>,
    max: Number,
    list: Array as PropType<GraphScoreProps['list']>,
    glyphs: [String, Array] as PropType<GraphScoreProps['glyphs']>,
    palette: String as PropType<GraphScoreProps['palette']>,
    corner: String,
    className: String,
  },
  setup: (props, context) => numericSetup('Score', props, context),
})
