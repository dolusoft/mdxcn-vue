import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('built Knap page contains real ASCII and Comark filter outputs', () => {
  const html = readFileSync(new URL('../.vitepress/dist/docs/knap.html', import.meta.url), 'utf8')
  assert.match(html, /data-knap="ascii"/)
  assert.match(html, /\[ SHIPPED \]/)
  assert.match(html, /67%/)
  assert.match(html, /data-knap="comark"/)
  assert.match(html, /::graph-meter/)
  assert.match(html, /value: 0\.67/)
})
test('built Markdown upgrades page renders all four components and keeps every footnote backlink', () => {
  const html = readFileSync(new URL('../.vitepress/dist/docs/mdx.html', import.meta.url), 'utf8')
  const figures = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map((match) => match[0])
  assert.equal(figures.length, 4)
  const footnotes = figures[3]
  assert.match(footnotes, /\[ footnotes \]/)
  assert.match(footnotes, /id="footnote1"/)
  assert.match(footnotes, /href="#footnote-ref1"/)
  assert.match(footnotes, /href="#footnote-ref1:1"/)
  assert.match(footnotes, /<strong>rich note<\/strong>/)
  assert.match(footnotes, /href="\/docs\/knap.html"/)
  assert.doesNotMatch(html, /<(?:Footnotes|Callout|Quote|Terminal)\b/)
  for (const figure of figures) assert.doesNotMatch(figure, /opacity:\s*0(?:;|")|translateY/)
})
