import { h } from 'vue'
import type { GraphTableProps, ProseNode } from '../src'
import { tableOf } from '../src'

const vnodeData: GraphTableProps = {
  title: 'Rich',
  rows: [[h('code', 'x()')]],
  footer: [h('strong', 'sum')],
}
void vnodeData
// @ts-expect-error Arbitrary objects are not renderable cells.
const invalid: GraphTableProps = { title: 'Bad', rows: [[{ label: 'not a VNode' }]] }
void invalid
const hostCell: string | ProseNode[] | undefined = tableOf([])?.rows[0]?.[0]
void hostCell
