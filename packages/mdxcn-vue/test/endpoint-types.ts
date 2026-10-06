import { h } from 'vue'
import { Endpoint } from '../src'
import type { EndpointBlock, EndpointParam, EndpointProps } from '../src'

const param: EndpointParam = { name: 'slug', required: true, description: h('code', 'graph-table') }
const block: EndpointBlock = { label: 'json', code: '{}' }
const props: EndpointProps = { method: null, path: null, params: [param], blocks: [block] }
h(Endpoint, props)
// @ts-expect-error Blocks require code.
const invalidBlock: EndpointBlock = { label: 'json' }
void invalidBlock
// @ts-expect-error Required is a boolean.
const invalidParam: EndpointParam = { name: 'slug', required: 'true' }
void invalidParam
