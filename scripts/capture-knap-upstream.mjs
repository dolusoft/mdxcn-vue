// Run only against the read-only shadcn-labs/mdxcn@16d817a checkout.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import ts from 'typescript'
const upstream = process.argv[2]
assert.ok(upstream, 'Usage: node scripts/capture-knap-upstream.mjs <upstream-checkout>')
const cache = new Map()
function load(path) {
  path = resolve(path)
  if (cache.has(path)) return cache.get(path)
  const code = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  cache.set(path, exports)
  const require = (id) =>
    load(
      id.startsWith('@/')
        ? resolve(upstream, id.slice(2) + '.ts')
        : resolve(dirname(path), id.replace(/\.js$/, '.ts')),
    )
  new Function('require', 'exports', code)(require, exports)
  return exports
}
import { writeFileSync } from 'node:fs'
const up = load(resolve(upstream, 'registry/default/graph-knap/graph-knap.ts'))
const props = {
  table: {
    headers: ['Name', 'Count'],
    rows: [
      ['Vue', '2'],
      ['Docs', '3'],
    ],
    footer: ['Sum', '5'],
    align: ['left', 'right'],
  },
  sheet: {
    headers: ['Name', 'Count'],
    sections: [{ title: 'Now', rows: [['Vue', '2']] }],
    footer: ['Sum', '2'],
  },
  invoice: {
    from: { name: 'Studio', lines: ['Road'] },
    to: { name: 'Client' },
    items: [{ description: 'Docs', qty: '2', rate: '$3', amount: '$6' }],
    totals: [{ label: 'Due', value: '$6' }],
  },
  spec: { rows: [{ label: 'Path', value: 'src', note: 'Read docs' }] },
  matrix: { columns: ['A', 'B'], rows: [{ label: 'R', values: [1000, 2.5] }] },
  compare: { columns: ['A', 'B'], rows: [{ label: 'R', values: [true, 'yes'] }] },
  diff: {
    rows: [{ label: 'app', value: '31 kb', sign: 'add' }],
    footer: { label: 'total', value: '31 kb' },
  },
  stat: { items: [{ value: '142ms', label: 'read', hint: '-18ms' }] },
  kpi: { value: '12', label: 'reads', hint: '+2', data: [1, 3, 2] },
  spark: { data: [0, 1, 4, 2], caption: 'Now' },
  bars: { from: { label: 'before', values: [1, 2] }, to: { label: 'after', values: [2, 3] } },
  slope: {
    fromLabel: 'before',
    toLabel: 'after',
    items: [{ label: 'read', from: 1200, to: 1400 }],
  },
  cells: {
    items: [
      {
        label: 'grid',
        cells: [
          [1, 0],
          [0, 1],
        ],
      },
    ],
  },
  meter: { value: 0.67, ticks: 10, caption: 'shipped' },
  waffle: { value: 0.73, cells: 12, columns: 5, caption: 'shipped' },
  stack: {
    rows: [
      {
        label: 'docs',
        segments: [
          { label: 'js', value: 3 },
          { label: 'css', value: 2 },
        ],
      },
    ],
    ticks: 10,
  },
  funnel: {
    steps: [
      { label: 'read', value: 1000, display: '1,000' },
      { label: 'ship', value: 860, display: '860' },
    ],
  },
  waterfall: {
    items: [
      { label: 'Revenue', value: 48 },
      { label: 'Refunds', value: -6 },
      { label: 'Profit', value: 42 },
    ],
  },
  rank: {
    items: [
      { label: 'Docs', value: 1200 },
      { label: 'Ship', value: 860 },
    ],
    ticks: 10,
  },
  bullet: { items: [{ label: 'CPU', value: 72, target: 80, max: 100 }] },
  uptime: { days: ['ok', 'degraded', 'down', 'empty', 'ok'], from: 'start', to: 'end', columns: 3 },
  tree: { nodes: [{ label: 'root', children: [{ label: 'leaf', meta: 'ui' }] }] },
  timeline: {
    events: [
      { date: 'one', label: 'read', state: 'now', note: 'A note' },
      { date: 'two', label: 'ship', state: 'next' },
    ],
  },
  gantt: {
    items: [{ label: 'build', start: 0.2, end: 0.8, complete: 0.5 }],
    ticks: ['0', '1'],
    progress: 0.4,
    columns: 10,
  },
  check: { items: [{ label: 'root', done: true, items: [{ label: 'sub', done: false }] }] },
  board: { columns: [{ title: 'Now', items: [{ label: 'ship', state: 'now', note: 'A note' }] }] },
  score: { items: [{ label: 'Docs', value: 2.5, max: 5 }] },
}
const bodies = {
  callout: 'Read **docs**.',
  quote: 'A useful note.',
  steps: '1. Copy — Run.\n2. **Register**',
  terminal: '$ run\noutput',
  changelog: '- added: Vue\n- fixed: Test',
  annotate: '```ts\nrun() // (1)\n```\n\n1. A note.',
  decision: '- **Vue** — typed\n- React — upstream\n\nKeep prose.',
  chat: '- you: Hello\n- agent: Hi',
  env: '```\n# Required\nAPI_KEY=one\n```',
  endpoint:
    'POST /api/test\n\nAbout.\n\n| Name | Type | Description |\n| --- | --- | --- |\n| **key** | string | Key |\n\n```json\n{}\n```',
  keys: '- Ctrl+K: Search',
  faq: '### Install?\n\nRun the CLI.',
}
const fixtures = []
for (const [short, data] of Object.entries(props))
  fixtures.push({ name: 'graph_' + short, value: JSON.stringify(data), param: 'TITLE' })
for (const [short, body] of Object.entries(bodies))
  fixtures.push({ name: 'graph_' + short, value: body, param: 'TITLE' })
for (const short of ['plot', 'heatmap', 'activity', 'calendar', 'flow', 'timer', 'countdown'])
  fixtures.push({
    name: 'graph_' + short,
    value: JSON.stringify({ title: 'TITLE', body: 'Read docs.' }),
  })
for (const fixture of fixtures) {
  const warnings = []
  fixture.expected = up.graphFilters[fixture.name](fixture.value, fixture.param, {
    reportWarning: (w) => warnings.push(w),
  })
  if (warnings.length) throw new Error(fixture.name + JSON.stringify(warnings))
}
writeFileSync(
  new URL('../packages/mdxcn-vue/test/fixtures/knap-upstream.json', import.meta.url),
  JSON.stringify(fixtures, null, 2) + '\n',
)
console.log('UPSTREAM_FIXTURES', fixtures.length)
