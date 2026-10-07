// Capture upstream bytes independently; never import the port's implementation.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import ts from 'typescript'

const upstream = process.argv[2]
assert.ok(upstream, 'Provide the read-only upstream checkout path')
const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' })
assert.equal(revision.status, 0)
assert.equal(revision.stdout.trim(), '16d817ad5ec54d89142e4c1cf26027b60d6df853')
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
const base = resolve(upstream, 'registry/default/graph-knap')
const frame = load(resolve(base, 'frame.ts'))
const graphs = load(resolve(base, 'graphs.ts'))
const yaml = load(resolve(base, 'yaml.ts'))
const filters = load(resolve(base, 'graph-knap.ts')).graphFilters
const fixture = {
  revision: revision.stdout.trim(),
  padEnd: { text: 'abcdef', size: 3, expected: frame.padEnd('abcdef', 3) },
  rank: { title: 'RANK', items: [{ label: 'fraction', value: 0.26 }], max: 1, ticks: 10 },
  funnel: { title: 'FUNNEL', steps: [{ label: 'read', value: 1234.5 }], ticks: 5 },
  flowMap: { rows: [{ 'x, y': 'value' }] },
  nestedKey: { outer: { 'x: y': 'value' } },
  nestedMapKey: { 'x: y': { child: 'value' } },
  malformed: [
    { name: 'graph_meter', value: JSON.stringify({ value: 'oops' }) },
    {
      name: 'graph_spec',
      value: JSON.stringify({ rows: [{ label: 'x' }, { label: 'y', value: { x: 1 } }] }),
    },
  ],
}
fixture.rankExpected = graphs.asciiRank(fixture.rank)
// Default locale is host-dependent. Capture under a controlled en-US locale,
// without changing the upstream call's argument contract.
const nativeLocaleString = Number.prototype.toLocaleString
try {
  Number.prototype.toLocaleString = function () {
    return nativeLocaleString.call(this, 'en-US')
  }
  fixture.funnelExpected = graphs.asciiFunnel(fixture.funnel)
} finally {
  Number.prototype.toLocaleString = nativeLocaleString
}
fixture.flowMapUpstream = yaml.toYaml(fixture.flowMap)
fixture.nestedKeyUpstream = yaml.toYaml(fixture.nestedKey)
fixture.nestedMapKeyUpstream = yaml.toYaml(fixture.nestedMapKey)
// Explicit corrections to upstream's known invalid YAML, independent of the port.
fixture.flowMapExpected = 'rows:\n  - { "x, y": value }'
fixture.nestedKeyExpected = 'outer:\n  "x: y": value'
fixture.nestedMapKeyExpected = '"x: y":\n  child: value'
for (const item of fixture.malformed) {
  const warnings = []
  item.expected = filters[item.name](item.value, undefined, {
    reportWarning: (w) => warnings.push(w),
  })
  assert.deepEqual(warnings, [])
}
writeFileSync(
  new URL('../packages/mdxcn-vue/test/fixtures/knap-edge-cases.json', import.meta.url),
  JSON.stringify(fixture, null, 2) + '\n',
)
console.log('UPSTREAM EDGE FIXTURES CAPTURED: padEnd, funnel, rank, YAML keys, malformed input')
