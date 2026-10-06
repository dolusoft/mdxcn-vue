import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(repo, 'packages/mdxcn-vue/src')
const license = readFileSync(join(repo, 'LICENSE'), 'utf8').replaceAll('\r\n', '\n').trim()
const check = process.argv.includes('--check')
const cliOutput = process.argv[process.argv.indexOf('--from-cli') + 1]
const useCli = process.argv.includes('--from-cli')
const definitions = [
  ['graph-stack', ['components/graph-stack.ts']],
  ['graph-table', ['components/graph-table.ts']],
  ['endpoint', ['components/endpoint.ts']],
  ['graph-timer', ['components/graph-timer.ts']],
  ['callout', ['components/callout.ts']],
  ['quote', ['components/quote.ts']],
  ['terminal', ['components/terminal.ts']],
  ['annotate', ['components/annotate.ts']],
  ['env', ['components/env.ts']],
  ['steps', ['components/steps.ts']],
  ['changelog', ['components/changelog.ts']],
  ['decision', ['components/decision.ts']],
  ['graph-frame', ['components/graph-frame.ts']],
  ['core', ['core/index.ts']],
  ['css', ['styles/graph.css', 'styles/host.css', 'styles/theme.css']],
]
function closure(entries) {
  const paths = new Set()
  function visit(path) {
    if (paths.has(path)) return
    paths.add(path)
    const content = readFileSync(join(src, path), 'utf8')
    for (const match of content.matchAll(/(?:from\s*|@import\s*)['"]([^'"]+)['"]/g)) {
      if (!match[1].startsWith('.')) continue
      const relative = resolve(src, dirname(path), match[1].replace(/\.js$/, '.ts'))
      const target = existsSync(relative) ? relative : `${relative}.ts`
      assert.ok(
        target.startsWith(src + '/'.replace('/', process.platform === 'win32' ? '\\' : '/')),
        `Import outside source: ${path}`,
      )
      visit(target.slice(src.length + 1).replaceAll('\\', '/'))
    }
  }
  entries.forEach(visit)
  return [...paths].sort()
}
function output(path, value) {
  const content = JSON.stringify(value, null, 2) + '\n'
  const destination = join(repo, path)
  if (check)
    assert.equal(
      readFileSync(destination, 'utf8').replaceAll('\r\n', '\n'),
      content,
      `${path} is stale; run pnpm registry:build`,
    )
  else {
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, content)
  }
}
const items = definitions.map(([name, entries]) => ({
  $schema: 'https://shadcn-vue.com/schema/registry-item.json',
  name: `mdxcn-${name}`,
  type: name === 'css' ? 'registry:file' : name === 'core' ? 'registry:lib' : 'registry:component',
  title: `mdxcn ${name}`,
  description: `Vue 3 ${name} from the mdxcn-vue source tree.`,
  dependencies: ['vue@^3.5.0'],
  ...(name === 'css' ? { devDependencies: ['tailwindcss@^4'] } : {}),
  meta: { license: 'MIT', notice: license, upstream: 'shadcn-labs/mdxcn@16d817a' },
  docs: 'Files use relative imports under src/components/mdxcn. Import styles/graph.css, host.css and optional theme.css from your Tailwind v4 CSS entry. Keep the full MIT notice with copied files.',
  files: [
    ...closure(entries).map((path) => ({
      path: `packages/mdxcn-vue/src/${path}`,
      type: 'registry:file',
      target: `~/src/components/mdxcn/${path}`,
      content:
        `/*\n${license}\n*/\n` + readFileSync(join(src, path), 'utf8').replaceAll('\r\n', '\n'),
    })),
  ],
}))
if (useCli) {
  for (const item of items) {
    const built = JSON.parse(readFileSync(join(cliOutput, item.name + '.json'), 'utf8'))
    assert.equal(built.type, item.type)
    assert.equal(built.files.length, item.files.length)
    for (const [index, file] of built.files.entries()) {
      const expected = item.files[index]
      assert.equal(file.path, expected.path)
      assert.equal(file.target, expected.target)
      assert.equal('/*\n' + license + '\n*/\n' + file.content, expected.content)
      // Normalize CLI output for per-file MIT distribution.
      expected.content = '/*\n' + license + '\n*/\n' + file.content
    }
  }
}
for (const item of items) output(`public/r/${item.name}.json`, item)
output('registry.json', {
  $schema: 'https://shadcn-vue.com/schema/registry.json',
  name: 'mdxcn-vue',
  homepage: 'https://github.com/dolusoft/mdxcn-vue',
  meta: { license: 'MIT', notice: license },
  // The build index references real sources without embedded content.
  items: items.map((item) => ({
    ...item,
    files: item.files.map(({ path, type, target }) => ({
      path,
      type,
      target,
    })),
  })),
})
assert.equal(
  readdirSync(join(repo, 'public/r')).filter((path) => path.endsWith('.json')).length,
  items.length,
)
console.log(
  `REGISTRY ${check ? 'CHECK' : 'BUILD'} PASSED: ${items.length} items from library sources`,
)
