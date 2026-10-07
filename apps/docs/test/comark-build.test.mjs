import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'

test('built Comark page renders body, YAML, responsive row and pending frame', () => {
  const html = readFileSync(new URL('../.vitepress/dist/docs/comark.html', import.meta.url), 'utf8')
  const figures = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map((match) => match[0])
  assert.equal(figures.length, 3)
  assert.ok(figures[0].includes('aria-label="docs: js 3"'))
  assert.ok(figures[0].includes('aria-label="app: css 2"'))
  assert.ok(figures[1].includes('parsed at build time'))
  assert.ok(figures[1].includes('86%'))
  assert.ok(figures[2].includes('· · ·'))
  assert.ok(html.includes('grid-cols-1 sm:grid-cols-2'))
  for (const figure of figures) assert.doesNotMatch(figure, /opacity:\s*0(?:;|")|translateY/)
  assert.doesNotMatch(html, /<graph-(?:stack|meter|table)\b/)
})

test('Comark parser stays outside the production client bundle', () => {
  const assets = new URL('../.vitepress/dist/assets/', import.meta.url)
  const js = readdirSync(assets).filter((name) => name.endsWith('.js'))
    .map((name) => readFileSync(new URL(name, assets), 'utf8')).join('\n')
  assert.doesNotMatch(js, /YAMLException|function parseMarkdown\(|micromark|parseComark/)
})
