import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { numericSetup } from './numeric-list.js'
import type { GraphFunnelProps } from './numeric-list.js'
export type { GraphFunnelProps } from './numeric-list.js'
export const GraphFunnel = defineComponent({
  name: 'GraphFunnel',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    steps: Array as PropType<GraphFunnelProps['steps']>,
    stage: String,
    list: Array as PropType<GraphFunnelProps['list']>,
    ticks: { type: [Number, String], default: 20 },
    glyphs: [String, Array] as PropType<GraphFunnelProps['glyphs']>,
    palette: String as PropType<GraphFunnelProps['palette']>,
    corner: String,
    className: String,
  },
  setup: (props, context) => numericSetup('Funnel', props, context),
})
export { Stage } from '../adapters/numeric-list.js'
