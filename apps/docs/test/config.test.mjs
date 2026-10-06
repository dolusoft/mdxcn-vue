import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { resolveConfig as resolveViteConfig } from 'vite'
import { resolveConfig as resolveDocsConfig } from 'vitepress'

const root = fileURLToPath(new URL('../', import.meta.url))

// Resolve configs without creating a dev server or binding any port.
async function resolve(command) {
  const docs = await resolveDocsConfig(root, command)
  return resolveViteConfig(
    {
      ...docs.vite,
      root: docs.srcDir,
      configFile: docs.vite?.configFile,
    },
    command,
  )
}

test('docs enables Vue and Vite DevTools together during development', async () => {
  const config = await resolve('serve')
  assert.equal(config.configFile.replaceAll('\\', '/'), `${root.replaceAll('\\', '/')}vite.config.ts`)
  assert.equal(config.devtools.enabled, true)
  assert.equal(config.devtools.apply, 'serve')
  const names = config.plugins.map((plugin) => plugin.name)
  assert.ok(names.includes('vite-plugin-vue-devtools'))
  assert.ok(names.includes('vite:devtools:injection'))
  assert.ok(names.includes('vite:devtools:server'))
  assert.ok(names.includes('@tailwindcss/vite:generate:serve'))
})

test('docs excludes both DevTools from production builds', async () => {
  const config = await resolve('build')
  const names = config.plugins.map((plugin) => plugin.name)
  assert.ok(!names.includes('vite-plugin-vue-devtools'))
  assert.ok(!names.some((name) => name.startsWith('vite:devtools')))
  assert.ok(names.includes('@tailwindcss/vite:generate:build'))
})
