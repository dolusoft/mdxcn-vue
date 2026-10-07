import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const scratch = resolve(repo, '../tmp/mdxcn-vue/f11a-bundles')
mkdirSync(scratch, { recursive: true })
const results = {}
for (const name of ['all', 'GraphStack', 'Footnotes']) {
  const entry = resolve(scratch, `${name}.js`)
  writeFileSync(
    entry,
    name === 'all'
      ? "import * as components from 'mdxcn-vue';globalThis.components=components;"
      : `import {${name}} from 'mdxcn-vue';globalThis.component=${name};`,
  )
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
}
const mode = process.argv.includes('--baseline') ? 'before' : 'after'
writeFileSync(resolve(scratch, `${mode}.json`), JSON.stringify(results, null, 2))
console.log(`ROOT TREE-SHAKE (${mode}, Vite/Rolldown, minify=false): ${JSON.stringify(results)}`)
