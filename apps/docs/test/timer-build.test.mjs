import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('built GraphTimer examples all use deterministic visible SSR placeholders', () => {
  const html = readFileSync(new URL('../.vitepress/dist/components/graph-timer.html', import.meta.url), 'utf8')
  const figures = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map((match) => match[0])
  assert.equal(figures.length, 3)
  for (const [index, figure] of figures.entries()) {
    assert.ok(figure.includes(index === 1 ? '0s ago' : '00:00:00'))
    assert.ok(figure.includes('<span class="sr-only">timer</span>'))
    assert.doesNotMatch(figure, /opacity:\s*0(?:;|")|translateY/)
  }
  assert.ok(figures[0].includes('api</p>'))
  assert.ok(figures[1].includes('last deploy</p>'))
  assert.ok(figures[2].includes('LOCAL'))
})
