import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('built GraphTable page renders upstream examples and three equal inputs', () => {
  const html = readFileSync(new URL('../.vitepress/dist/docs/graph-table.html', import.meta.url), 'utf8')
  const figures = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map((match) => match[0])
  assert.equal(figures.length, 4)
  const tables = figures.slice(0, 3).map((figure) => figure.match(/<table\b[\s\S]*?<\/table>/)?.[0]?.replace(/aria-labelledby="[^"]+"/, 'aria-labelledby="caption"'))
  assert.equal(tables[0], tables[1])
  assert.equal(tables[0], tables[2])
  for (const figure of figures.slice(0, 3)) {
    const id = figure.match(/<figcaption\b[^>]*id="([^"]+)"/)?.[1]
    assert.ok(id)
    assert.ok(figure.includes(`role="region" aria-labelledby="${id}"`))
    assert.ok(figure.includes(`aria-labelledby="${id}"><thead>`))
    assert.equal((figure.match(/scope="col"/g) ?? []).length, 4)
    assert.ok(figure.includes('437,141'))
    assert.ok(figure.includes('<tfoot>'))
  }
  assert.ok(figures[3].includes('springs for gestures'))
  assert.ok(figures[3].includes('they carry your momentum'))
  for (const figure of figures) assert.doesNotMatch(figure, /opacity:\s*0(?:;|")|translateY/)
})
