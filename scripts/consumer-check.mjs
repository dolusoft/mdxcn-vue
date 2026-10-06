import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// Keep fixtures outside the repository, under the authorized scratch directory.
const scratch = resolve(repo, '../tmp/mdxcn-vue')
mkdirSync(scratch, { recursive: true })
const root = mkdtempSync(join(scratch, 'consumer-'))
const pnpmCli = process.env.npm_execpath
assert.ok(pnpmCli, 'Run this script with pnpm consumer:check')
function run(args, cwd, capture = false) {
  // pnpm 12 can expose a native executable (Windows .exe / Linux no suffix).
  const native = !/\.[cm]?js$/i.test(pnpmCli)
  const result = spawnSync(
    native ? pnpmCli : process.execPath,
    native ? args : [pnpmCli, ...args],
    {
      cwd,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, CI: 'true' },
    },
  )
  if (!capture || result.status !== 0) process.stdout.write(result.stdout ?? '')
  if (result.stderr) process.stderr.write(result.stderr)
  assert.equal(result.status, 0, `pnpm ${args.join(' ')} failed in ${cwd}: ${result.error ?? ''}`)
  return result.stdout
}
function write(dir, path, value) {
  mkdirSync(dirname(join(dir, path)), { recursive: true })
  writeFileSync(join(dir, path), typeof value === 'string' ? value : JSON.stringify(value, null, 2))
}
function files(dir, extension) {
  return readdirSync(dir, { recursive: true })
    .filter((name) => name.endsWith(extension))
    .map((name) => join(dir, name))
}
const artifacts = join(root, 'artifacts')
mkdirSync(artifacts)
for (const name of ['mdxcn-vue', 'mdxcn-markdown']) {
  const cwd = join(repo, 'packages', name)
  const packed = Object.values(
    JSON.parse(run(['exec', 'npm', 'pack', '--dry-run', '--json'], cwd, true)),
  )[0]
  const names = packed.files.map((file) => file.path)
  for (const required of [
    'LICENSE',
    'README.md',
    'package.json',
    'dist/index.d.ts',
    'dist/index.js',
  ])
    assert.ok(names.includes(required), `${name}: missing ${required}`)
  assert.ok(
    names.every(
      (path) =>
        ['LICENSE', 'README.md', 'package.json'].includes(path) ||
        /^dist\/.*\.(?:js|ts|css)$/.test(path),
    ),
    `${name}: unexpected packed files`,
  )
  if (name === 'mdxcn-vue')
    for (const required of [
      'dist/core.js',
      'dist/core/index.d.ts',
      'dist/graph.css',
      'dist/host.css',
      'dist/theme.css',
    ])
      assert.ok(names.includes(required))
  assert.match(readFileSync(join(cwd, 'LICENSE'), 'utf8'), /Keshav Bagaade/)
  assert.match(readFileSync(join(cwd, 'README.md'), 'utf8'), /Keshav Bagaade/)
  run(['pack', '--out', join(artifacts, `${name}.tgz`)], cwd)
  console.log(`PACK ${name}: ${names.length} files, ${packed.size} bytes`)
}
const vueDist = join(repo, 'packages/mdxcn-vue/dist')
const libraryCode = files(vueDist, '.js')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
assert.match(libraryCode, /from ["']vue["']/)
assert.doesNotMatch(libraryCode, /function createApp|function createRenderer|@vue\/runtime-core/)

const common = {
  vue: '3.5.43',
  vite: '8.3.3',
  '@vitejs/plugin-vue': '6.0.9',
  tailwindcss: '4.3.3',
  '@tailwindcss/vite': '4.3.3',
  typescript: '6.0.3',
  'vue-tsc': '3.3.12',
}
const vueTar = `file:${join(artifacts, 'mdxcn-vue.tgz').replaceAll('\\', '/')}`
const markdownTar = `file:${join(artifacts, 'mdxcn-markdown.tgz').replaceAll('\\', '/')}`
const tsconfig = {
  compilerOptions: {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    strict: true,
    skipLibCheck: false,
    lib: ['ES2022', 'DOM'],
    types: ['vite/client'],
  },
  include: ['src/**/*.ts', 'src/**/*.vue'],
}
const css =
  '@import "tailwindcss";\n@import "mdxcn-vue/graph.css";\n@import "mdxcn-vue/host.css";\n@import "mdxcn-vue/theme.css";\n'
const viteConfig = `import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwind from '@tailwindcss/vite';
import {writeFileSync} from 'node:fs';
export default defineConfig({plugins:[vue(),tailwind(),{
  name:'consumer-modules', generateBundle() {writeFileSync('modules.json',JSON.stringify([...this.getModuleIds()]));}
}],build:{minify:false}});
`
const app = join(root, 'vite-app')
write(app, 'package.json', {
  name: 'consumer-app',
  private: true,
  type: 'module',
  dependencies: { ...common, 'mdxcn-vue': vueTar, 'mdxcn-markdown': markdownTar, 'markdown-it': '14.1.0' },
})
write(app, 'tsconfig.json', tsconfig)
write(app, 'vite.config.ts', viteConfig)
write(
  app,
  'index.html',
  '<html><head></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>',
)
write(app, 'src/style.css', css)
write(
  app,
  'src/App.vue',
  `<script setup lang="ts">
import {GraphStack,GraphTable,Endpoint,GraphTimer} from 'mdxcn-vue';
import {splitLabel} from 'mdxcn-vue/core';
import type {StackRow,TableModel} from 'mdxcn-vue/core';
const rows: StackRow[]=[{label:splitLabel('Web: 1 js').label,segments:[{label:'js',value:1}]}];
const table:TableModel={headers:['A'],rows:[['B']]};
</script><template><GraphStack title="STACK" :rows="rows"/><GraphTable title="TABLE" v-bind="table"/><Endpoint/><GraphTimer title="TIMER" kind="clock"/></template>`,
)
write(
  app,
  'src/main.ts',
  "import {createApp} from 'vue';import App from './App.vue';import './style.css';createApp(App).mount('#app');",
)
write(app, 'src/type-contract.ts', `import {splitLabel} from 'mdxcn-vue/core';
import type {StackRow} from 'mdxcn-vue/core';
import type {GraphStackProps} from 'mdxcn-vue';
import {mdxcnMarkdown,withMdxcn} from 'mdxcn-markdown';
import type {MdxcnOptions} from 'mdxcn-markdown';
import MarkdownIt from 'markdown-it';
const row:StackRow={label:splitLabel('Web: 1 js').label,segments:[{label:'js',value:1}]};
const graph:GraphStackProps={rows:[row]};
const options:MdxcnOptions={components:['Terminal']};
new MarkdownIt().use(mdxcnMarkdown).use(withMdxcn,options);
// @ts-expect-error Unknown fields must not silently become any.
row.nonexistent=1;
// @ts-expect-error The root entry must preserve prop types.
graph.rows='wrong';
// @ts-expect-error Markdown declarations must preserve component names.
options.components=['Missing'];
// @ts-expect-error Subpath functions must preserve their return types.
splitLabel('Web').nonexistent;
`)
write(app, 'tsconfig.nodenext.json', {
  compilerOptions: {...tsconfig.compilerOptions, module:'NodeNext',moduleResolution:'NodeNext'},
  include:['src/type-contract.ts'],
})
run(['install'], app)
run(['exec','tsc','--noEmit','-p','tsconfig.nodenext.json'],app)
console.log('TYPE CONTRACT PASSED: NodeNext, skipLibCheck=false; invalid fields rejected')
run(['exec', 'vue-tsc', '--noEmit'], app)
run(['exec', 'vite', 'build'], app)
const fullBytes = files(join(app, 'dist/assets'), '.js').reduce(
  (sum, path) => sum + Buffer.byteLength(readFileSync(path)),
  0,
)
const builtCss = files(join(app, 'dist/assets'), '.css')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
for (const selector of [
  '.graph-frame',
  '.graph-scroll-x',
  '.text-graph-muted',
  '.grid-cols-',
  '.px-5',
])
  assert.ok(builtCss.includes(selector), `Missing ${selector}`)

// Negative control: without packaged @source, package-only utilities disappear.
const noSource = ['graph', 'host', 'theme']
  .map((name) =>
    readFileSync(join(vueDist, `${name}.css`), 'utf8')
      .replace(/@source[^;]+;/g, '')
      .replace(/@import\s+['"]\.\/(?:graph|host|theme)\.css['"];?/g, ''),
  )
  .join('\n')
write(app, 'src/no-source.css', '@import "tailwindcss" source(none);\n@source "./";\n' + noSource)
write(
  app,
  'src/main.ts',
  "import {createApp} from 'vue';import App from './App.vue';import './no-source.css';createApp(App).mount('#app');",
)
run(['exec', 'vite', 'build'], app)
const negativeCss = files(join(app, 'dist/assets'), '.css')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
assert.ok(
  !negativeCss.includes('.px-5'),
  'Negative control unexpectedly generated package-only utilities',
)

// A separate JS-only build measures GraphStack without other component imports.
write(
  app,
  'src/main.ts',
  "import {createApp,h} from 'vue';import {GraphStack} from 'mdxcn-vue';createApp({render:()=>h(GraphStack,{title:'ONLY',rows:[{label:'Web',segments:[{value:1,label:'js'}]}]})}).mount('#app');",
)
run(['exec', 'vite', 'build'], app)
const stackBundle = files(join(app, 'dist/assets'), '.js')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
assert.match(stackBundle, /GraphStack/)
assert.doesNotMatch(
  stackBundle,
  /GraphTable|Endpoint|mdxcn-markdown|markdown-it|@comark|shiki|knap/,
)
const modules = JSON.parse(readFileSync(join(app, 'modules.json'), 'utf8'))
const vueEntries = modules.filter((id) =>
  /\/vue\/dist\/vue\.runtime\.esm-bundler\.js$/.test(id.replaceAll('\\', '/')),
)
assert.equal(vueEntries.length, 1, 'Expected exactly one Vue runtime entry')
assert.ok(!modules.some((id) => /mdxcn-markdown|markdown-it|@comark|shiki|knap/.test(id)))
const stackBytes = Buffer.byteLength(stackBundle)
console.log(
  `TREE-SHAKE full=${fullBytes} bytes GraphStack=${stackBytes} bytes removed=${fullBytes - stackBytes} bytes; Vue runtime entries=${vueEntries.length}`,
)

const site = join(root, 'vitepress-site')
write(site, 'package.json', {
  name: 'consumer-site',
  private: true,
  type: 'module',
  dependencies: {
    ...common,
    'mdxcn-vue': vueTar,
    'mdxcn-markdown': markdownTar,
    'markdown-it': '14.1.0',
    vitepress: '2.0.0-alpha.20',
  },
})
write(
  site,
  '.vitepress/config.ts',
  `import {defineConfig} from 'vitepress';import {mdxcnMarkdown,withMdxcn} from 'mdxcn-markdown';import tailwind from '@tailwindcss/vite';
export default defineConfig({markdown:{config:(md)=>{md.use(mdxcnMarkdown,{warn:(w)=>{throw new Error(JSON.stringify(w))}});md.use(withMdxcn,{warn:(w)=>console.log('EXPECTED_FALLBACK '+w.component)});}},vite:{plugins:[tailwind()]}});`,
)
write(
  site,
  '.vitepress/theme/index.ts',
  `import DefaultTheme from 'vitepress/theme';import {GraphStack,GraphTable,Endpoint} from 'mdxcn-vue';import './style.css';export default {...DefaultTheme,enhanceApp({app}) {app.component('GraphStack',GraphStack);app.component('GraphTable',GraphTable);app.component('Endpoint',Endpoint);}};`,
)
write(site, '.vitepress/theme/style.css', css)
write(
  site,
  'index.md',
  '# Consumer\n\n<GraphStack title="STACK">\n\n- Web: 1 js\n\n</GraphStack>\n\n<GraphTable title="TABLE">\n\n| A |\n| --- |\n| B |\n\n</GraphTable>\n\n<Endpoint title="API">\n\nPOST /consumer\n\n```json\n{}\n```\n\n</Endpoint>',
)
run(['install'], site)
run(['peers', 'check'], site)
write(
  site,
  'index.md',
  readFileSync(join(site, 'index.md'), 'utf8') +
    '\n\n> [!NOTE]\n> Upgrade body.\n\n> Quote body.\n> — Ada, Notes\n\n```console\n$ run\noutput\n```\n\nFoot[^1].\n\n[^1]: Note body.\n',
)
const siteOutput = run(['exec', 'vitepress', 'build'], site, true)
const fallbackNames = [...siteOutput.matchAll(/EXPECTED_FALLBACK (\w+)/g)]
  .map((match) => match[1])
  .sort()
assert.deepEqual(fallbackNames, ['Callout', 'Footnotes', 'Quote', 'Terminal'])
const html = readFileSync(join(site, '.vitepress/dist/index.html'), 'utf8')
assert.equal((html.match(/<figure\b/g) ?? []).length, 3)
for (const value of ['Web', 'B', '/consumer']) assert.ok(html.includes(value))
for (const value of [
  'custom-block github-alert',
  'data-mdxcn="Quote"',
  'Quote body.',
  '$ run',
  'id="footnote1"',
  'href="#footnote-ref1"',
])
  assert.ok(html.includes(value), `Missing upgrade fallback ${value}`)
assert.doesNotMatch(html, /<(?:Callout|Quote|Terminal|Footnotes)\b/)
console.log('VITEPRESS CONSUMER PASSED: 3 compiled figures, 4 warned native upgrade fallbacks')

// Install generated registry payloads with the real CLI, without a server.
run(['registry:check'], repo)
const registry = join(root, 'registry-app')
write(registry, 'package.json', {
  name: 'consumer-registry',
  private: true,
  type: 'module',
  packageManager: 'pnpm@12.4.1',
  dependencies: { ...common, 'shadcn-vue': '2.8.2' },
})
write(registry, 'tsconfig.json', {
  ...tsconfig,
  compilerOptions: { ...tsconfig.compilerOptions, paths: { '@/*': ['./src/*'] } },
})
write(registry, 'vite.config.ts', viteConfig)
write(registry, 'index.html', readFileSync(join(app, 'index.html'), 'utf8'))
write(registry, 'components.json', {
  $schema: 'https://shadcn-vue.com/schema.json',
  style: 'new-york',
  typescript: true,
  tailwind: { config: '', css: 'src/style.css', baseColor: 'neutral', cssVariables: true },
  aliases: {
    components: '@/components',
    ui: '@/components/ui',
    utils: '@/lib/utils',
    lib: '@/lib',
    composables: '@/composables',
  },
})
write(
  registry,
  'src/style.css',
  '@import "tailwindcss";\n@import "./components/mdxcn/styles/graph.css";\n@import "./components/mdxcn/styles/host.css";\n@import "./components/mdxcn/styles/theme.css";\n',
)
write(
  registry,
  'src/main.ts',
  "import {createApp} from 'vue';import App from './App.vue';import './style.css';createApp(App).mount('#app');",
)
const registryApp = readFileSync(join(app, 'src/App.vue'), 'utf8')
  .replace(
    "import {GraphStack,GraphTable,Endpoint,GraphTimer} from 'mdxcn-vue';",
    "import {GraphStack} from './components/mdxcn/components/graph-stack';import {GraphTable} from './components/mdxcn/components/graph-table';import {Endpoint} from './components/mdxcn/components/endpoint';import {GraphTimer} from './components/mdxcn/components/graph-timer';",
  )
  .replaceAll("'mdxcn-vue/core'", "'./components/mdxcn/core'")
write(registry, 'src/App.vue', registryApp)
run(['install'], registry)
const cliOutput = join(root, 'registry-build')
run(['exec', 'shadcn-vue', 'build', 'registry.json', '--cwd', repo, '--output', cliOutput], registry)
run(['exec', 'node', 'scripts/registry-build.mjs', '--check', '--from-cli', cliOutput], repo)
console.log('REGISTRY CLI BUILD PASSED: real source index and normalized payload parity')
const registryPaths = files(join(repo, 'public/r'), '.json').sort()
const localItems = registryPaths.map((path) => {
  const target = `registry-input/${basename(path)}`
  write(registry, target, readFileSync(path, 'utf8'))
  return `./${target}`
})
const registryInstall = run(['exec', 'shadcn-vue', 'add', '--overwrite', ...localItems], registry, true)
assert.doesNotMatch(registryInstall, /overwrite.*(?:CSS|variables)|[?❯]/i)
console.log('REGISTRY PROMPT CHECK PASSED: closed stdin, no --yes')
const copied = new Set()
for (const path of registryPaths) {
  const item = JSON.parse(readFileSync(path, 'utf8'))
  assert.match(item.meta.notice, /Keshav Bagaade/)
  for (const file of item.files) {
    assert.match(file.content, /Keshav Bagaade/)
    assert.equal(
      readFileSync(join(registry, file.target.replace(/^~\//, '')), 'utf8')
        .replaceAll('\r\n', '\n')
        .trim(),
      file.content.replaceAll('\r\n', '\n').trim(),
      `Registry CLI changed ${file.target}`,
    )
    copied.add(file.target)
  }
}
run(['exec', 'vue-tsc', '--noEmit'], registry)
run(['exec', 'vite', 'build'], registry)
const registryCss = files(join(registry, 'dist/assets'), '.css')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
for (const selector of ['.graph-frame', '.px-5', '.text-graph-muted'])
  assert.ok(registryCss.includes(selector))
console.log(
  `REGISTRY INSTALL PASSED: shadcn-vue 2.8.2, ${registryPaths.length} items, ${copied.size} source files; typecheck and build passed`,
)
write(root, 'results.json', {
  fullBytes,
  stackBytes,
  removedBytes: fullBytes - stackBytes,
  vueRuntimeEntries: vueEntries.length,
  vitepressFigures: 3,
  upgradeFallbacks: fallbackNames,
  registryItems: registryPaths.length,
  registryFiles: copied.size,
})
console.log(`CONSUMER CHECK PASSED; artifacts: ${root}`)
