import { readFileSync, readdirSync, mkdirSync, mkdtempSync, writeFileSync, rmSync, cpSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('built GraphStack page renders all three inputs and token examples visibly', () => {
  const html = readFileSync(new URL('../.vitepress/dist/docs/graph-stack.html', import.meta.url), 'utf8')
  const figures = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map((match) => match[0])
  assert.equal(figures.length, 5)
  for (const figure of figures.slice(0, 3)) {
    assert.ok(figure.includes('aria-label="marketing: js 48, css 22, images 30"'))
    assert.ok(figure.includes('aria-label="docs: js 28, css 18, images 54"'))
    assert.equal((figure.match(/class="min-w-0 flex-1 overflow-hidden text-center/g) ?? []).length, 48)
  }
  for (const figure of figures.slice(3)) assert.ok(figure.includes('aria-label="week: prompt 61, completion 27, cached 12"'))
  for (const figure of figures) assert.doesNotMatch(figure, /opacity:\s*0(?:;|")|translateY/)
})

test('built CSS contains graph rules and the docs font', () => {
  const assets = new URL('../.vitepress/dist/assets/', import.meta.url)
  const styles = readdirSync(assets).filter((name) => name.endsWith('.css')).map((name) => readFileSync(new URL(name, assets), 'utf8')).join('\n')
  assert.ok(styles.includes('.graph-frame{'))
  assert.ok(styles.includes('repeating-linear-gradient'))
  assert.ok(styles.includes('.graph-title-ink{'))
  assert.ok(styles.includes('.graph-title-ink.text-graph-accent{'))
  assert.ok(styles.includes('.text-graph-muted{'))
  assert.ok(styles.includes('.text-graph-accent-3{'))
  assert.ok(styles.includes('Geist Mono'))
  assert.ok(styles.includes('@font-face'))
  assert.ok(styles.includes('Geist Mono Fallback'))
  assert.ok(styles.includes('size-adjust:134.59%'))
  const html = readFileSync(new URL('../.vitepress/dist/index.html', import.meta.url), 'utf8')
  const preloads = [...html.matchAll(/<link[^>]*rel="preload"[^>]*as="font"[^>]*href="([^"]+)"/g)]
  assert.equal(preloads.length, 2)
  for (const [, href] of preloads) {
    assert.ok(!href.startsWith('//'), `Protocol-relative font preload: ${href}`)
    assert.ok(href.startsWith('/assets/'), `Unexpected font preload path: ${href}`)
    assert.ok(href.endsWith('.woff2'))
    assert.ok(readFileSync(new URL(`../.vitepress/dist${href}`, import.meta.url)).length > 0)
  }
  assert.ok(readdirSync(assets).some((name) => name.endsWith('.woff2')))
})

test('isolated consumer discovers package classes only through @source', async () => {
  const scratch = fileURLToPath(new URL('../../../../tmp/mdxcn-vue/', import.meta.url))
  mkdirSync(scratch, { recursive: true })
  // Honor the workspace scratch policy while exercising the platform temp API.
  const tempKey = process.platform === 'win32' ? 'TEMP' : 'TMPDIR'
  const previousTemp = process.env[tempKey]
  process.env[tempKey] = scratch
  let fixture
  const distributed = dirname(fileURLToPath(import.meta.resolve('mdxcn-vue/theme.css')))
  const css = '@import "tailwindcss" source(none);\n@import "mdxcn-vue/theme.css";'
  try {
    fixture = mkdtempSync(join(tmpdir(), 'source-consumer-'))
    writeFileSync(join(fixture, 'input.css'), css)
    writeFileSync(join(fixture, 'index.html'), '<main>Consumer fixture</main>')
    for (const registered of [true, false]) {
      const target = registered ? distributed : join(fixture, 'control')
      if (!registered) {
        cpSync(distributed, target, { recursive: true })
        const graph = join(target, 'graph.css')
        writeFileSync(graph, readFileSync(graph, 'utf8').replace(/@source\s+["'][^"']+["'];/, ''))
        assert.ok(readdirSync(target).includes('index.js'))
      }
      const compiler = await compile(css, {
        base: fixture,
        onDependency() {},
        customCssResolver: async (id) => id === 'mdxcn-vue/theme.css'
          ? join(target, 'theme.css')
          : id === 'tailwindcss' ? fileURLToPath(import.meta.resolve('tailwindcss/index.css')) : undefined,
      })
      assert.equal(compiler.root, 'none')
      const scanner = new Scanner({ sources: compiler.sources })
      const candidates = scanner.scan()
      const styles = compiler.build(candidates)
      for (const selector of ['.text-graph-muted', '.text-graph-accent-3', '.graph-title-ink', '.grid-cols-'])
        assert.equal(styles.includes(selector), registered, `${selector}: registered=${registered}`)
      assert.equal(candidates.includes('text-graph-muted'), registered)
    }
  } finally {
    if (fixture) rmSync(fixture, { recursive: true, force: true })
    if (previousTemp === undefined) delete process.env[tempKey]
    else process.env[tempKey] = previousTemp
  }
})
