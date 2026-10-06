import { readFileSync, readdirSync } from 'node:fs'
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

test('built CSS discovers distributed graph utilities through package @source', () => {
  const assets = new URL('../.vitepress/dist/assets/', import.meta.url)
  const styles = readdirSync(assets).filter((name) => name.endsWith('.css')).map((name) => readFileSync(new URL(name, assets), 'utf8')).join('\n')
  assert.ok(styles.includes('.graph-frame{'))
  assert.ok(styles.includes('repeating-linear-gradient'))
  assert.ok(styles.includes('.graph-title-ink{'))
  assert.ok(styles.includes('.graph-title-ink.text-graph-accent{'))
  assert.ok(styles.includes('.text-graph-muted{'))
  assert.ok(styles.includes('.text-graph-accent-3{'))
})
