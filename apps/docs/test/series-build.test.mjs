import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const normalize = (f) => f.outerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/ id="[^"]*"/g, '').replace(/ aria-labelledby="[^"]*"/g, '')
const page = (slug) => new JSDOM(readFileSync(new URL(`../.vitepress/dist/${slug}.html`, import.meta.url), 'utf8')).window.document
test('three upstream written examples and series edges retain equal compiler/runtime/data DOM', () => {
  const figures = [...page('test/fixtures/series').querySelectorAll('figure')]
  assert.equal(figures.length, 21)
  for (let i = 0; i < figures.length; i += 3) {
    assert.equal(normalize(figures[i]), normalize(figures[i + 1]))
    assert.equal(normalize(figures[i]), normalize(figures[i + 2]))
    assert.doesNotMatch(figures[i + 1].outerHTML, /header-anchor|\u200b/)
  }
  assert.equal(figures[0].querySelectorAll('[class~="w-[1ch]"] > span').length, 65)
  assert.equal(figures[6].querySelector('.sr-only').textContent, 'Sparkline with 9 points. three quiet days, then a busy week')
  assert.equal(figures[12].querySelector('.sr-only').textContent, 'Sparkline with 3 points')
  assert.equal(figures[15].querySelector('p').textContent, '**bold** link')
})
test('two docs pages render all five upstream examples visibly with expected glyphs', () => {
  const bars = [...page('components/graph-bars').querySelectorAll('figure')]
  const spark = [...page('components/graph-spark').querySelectorAll('figure')]
  assert.equal(bars.length, 2)
  assert.equal(spark.length, 3)
  assert.deepEqual(spark.map((f) => f.querySelector('[class~="gap-0.5"]').textContent), ['▃▃▁▁▁▅▇▆█', '▂▃▄▃▅▅▇▆▇▅█▇', '▄▄▅▃▆▇▆█▇▆▅▆'])
  for (const f of [...bars, ...spark]) assert.doesNotMatch(f.outerHTML, /opacity:\s*0(?:;|"|$)|translateY|header-anchor|<(?:GraphBars|GraphSpark)\b/)
})
