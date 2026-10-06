import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { numericSetup } from './numeric-list.js'
import type { GraphRankProps } from './numeric-list.js'
export type { GraphRankProps } from './numeric-list.js'
export const GraphRank = defineComponent({
  name: 'GraphRank',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    items: Array as PropType<GraphRankProps['items']>,
    max: Number,
    list: Array as PropType<GraphRankProps['list']>,
    ticks: { type: [Number, String], default: 20 },
    glyphs: [String, Array] as PropType<GraphRankProps['glyphs']>,
    palette: String as PropType<GraphRankProps['palette']>,
    corner: String,
    className: String,
  },
  setup: (props, context) => numericSetup('Rank', props, context),
})
export { Rank } from '../adapters/numeric-list.js'
