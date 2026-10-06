import { readFileSync, readdirSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('built GraphStack page renders all three inputs and token examples visibly', () => {
  const html = readFileSync(new URL('../.vitepress/dist/components/graph-stack.html', import.meta.url), 'utf8')
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
  assert.ok(readdirSync(assets).some((name) => name.endsWith('.woff2')))
})

test('isolated consumer discovers package classes only through @source', async () => {
  const scratch = fileURLToPath(new URL('../../../../tmp/mdxcn-vue/', import.meta.url))
  mkdirSync(scratch, { recursive: true })
  const fixture = mkdtempSync(join(scratch, 'source-consumer-'))
  const distributed = dirname(fileURLToPath(import.meta.resolve('mdxcn-vue/theme.css')))
  const css = '@import "tailwindcss" source(none);\n@import "mdxcn-vue/theme.css";'
  writeFileSync(join(fixture, 'input.css'), css)
  writeFileSync(join(fixture, 'index.html'), '<main>Consumer fixture</main>')
  try {
    for (const registered of [true, false]) {
      const target = registered ? distributed : join(fixture, 'control')
      if (!registered) {
        mkdirSync(target)
        for (const name of ['theme.css', 'host.css', 'graph.css']) {
          const content = readFileSync(join(distributed, name), 'utf8')
          writeFileSync(join(target, name), name === 'graph.css'
            ? content.replace(/@source\s+["'][^"']+["'];/, '') : content)
        }
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
    rmSync(fixture, { recursive: true, force: true })
  }
})
