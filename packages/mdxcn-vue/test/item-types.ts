import { h } from 'vue'
import { Bar, Segment } from '../src'

h(Bar, { label: 'bundle', segments: [{ value: '1', label: 'js' }] })
h(Segment, { value: '12', label: 'js' })
// @ts-expect-error Labels must be strings.
h(Bar, { label: 12 })
// @ts-expect-error Segment values cannot be objects.
h(Segment, { value: {} })
