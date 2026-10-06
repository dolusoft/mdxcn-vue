import { h } from 'vue'
import type { GraphTableProps } from '../src'

const vnodeData: GraphTableProps = {
  title: 'Rich',
  rows: [[h('code', 'x()')]],
  footer: [h('strong', 'sum')],
}
void vnodeData
// @ts-expect-error Arbitrary objects are not renderable cells.
const invalid: GraphTableProps = { title: 'Bad', rows: [[{ label: 'not a VNode' }]] }
void invalid
