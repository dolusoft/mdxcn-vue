import { h } from 'vue'
import { GraphTimer } from '../src'
import type { GraphTimerProps } from '../src'

const props: GraphTimerProps = { title: 'Time', at: new Date(0), caption: null, kind: 'clock' }
h(GraphTimer, props)
// @ts-expect-error Timer kinds are a closed union.
const invalidKind: GraphTimerProps = { title: 'Time', kind: 'countdown' }
void invalidKind
// @ts-expect-error The timer requires a title.
h(GraphTimer, { at: 0 })
