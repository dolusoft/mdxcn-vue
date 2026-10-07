import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// Scratch output stays in the repo's ignored cache instead of a sibling directory.
const scratch = resolve(repo, 'node_modules/.cache/tree-shaking-check')
mkdirSync(scratch, { recursive: true })
const results = {}
// `Baseline` pulls only the Vue runtime APIs the library needs itself, so the library's own
// share of a bundle can be asserted independently of the pinned Vue version.
const sources = {
  all: "import * as components from 'mdxcn-vue';globalThis.components=components;",
  Baseline:
    "import {defineComponent,h,withDirectives,useId,mergeProps,Fragment} from 'vue';globalThis.component=[defineComponent({setup:()=>()=>h('div',mergeProps({},{}),[h(Fragment)])}),withDirectives,useId];",
  GraphStack: "import {GraphStack} from 'mdxcn-vue';globalThis.component=GraphStack;",
  Footnotes: "import {Footnotes} from 'mdxcn-vue';globalThis.component=Footnotes;",
}
for (const [name, source] of Object.entries(sources)) {
  const entry = resolve(scratch, `${name}.js`)
  writeFileSync(entry, source)
  const result = await build({
    configFile: false,
    root: repo,
    logLevel: 'error',
    resolve: {
      alias: {
        'mdxcn-vue': resolve(repo, 'packages/mdxcn-vue/dist/index.js'),
        vue: resolve(repo, 'packages/mdxcn-vue/node_modules/vue/dist/vue.runtime.esm-bundler.js'),
      },
    },
    build: {
      write: false,
      minify: false,
      rolldownOptions: { input: entry, output: { format: 'es' } },
    },
  })
  const code = [result]
    .flat()
    .flatMap((output) => output.output)
    .filter((item) => item.type === 'chunk')
    .map((item) => item.code)
    .join('\n')
  writeFileSync(resolve(scratch, `${name}.bundle.js`), code)
  results[name] = Buffer.byteLength(code)
  if (!process.argv.includes('--baseline') && name === 'GraphStack') {
    assert.match(code, /GraphStack/)
    assert.doesNotMatch(
      code,
      /Footnotes|graphFilters|graph_filter|coerceProps|PendingGraph|toComarkBlock|asciiWaffle|"From"|"Rank"|"GraphRuleY"/,
    )
  }
}
if (!process.argv.includes('--baseline')) {
  assert.ok(
    results.GraphStack < results.all * 0.6,
    'Single-component bundle must be substantially smaller',
  )
  assert.ok(
    results.Footnotes < results.GraphStack,
    'Footnotes must not retain the graph drawing modules',
  )
  // Ratchet on the library's own share (minify=false: about 14000 and 8300 bytes today). A
  // retained item registry or component table adds tens of kilobytes without leaking a symbol.
  assert.ok(
    results.GraphStack - results.Baseline < 20_000,
    'GraphStack must not retain unrelated library code',
  )
  assert.ok(
    results.Footnotes - results.Baseline < 14_000,
    'Footnotes must not retain unrelated library code',
  )
}
const mode = process.argv.includes('--baseline') ? 'before' : 'after'
writeFileSync(resolve(scratch, `${mode}.json`), JSON.stringify(results, null, 2))
console.log(`ROOT TREE-SHAKE (${mode}, Vite/Rolldown, minify=false): ${JSON.stringify(results)}`)
