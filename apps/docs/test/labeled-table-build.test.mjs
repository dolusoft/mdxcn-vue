import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/labeled-table.html', import.meta.url), 'utf8')).window.document
const figures = [...doc.querySelectorAll('figure')]
const texts = (f, s) => [...f.querySelectorAll(s)].map(n => n.textContent)
test('six independent upstream examples retain compare marks, matrix values and heat glyphs', () => {
  assert.equal(figures.length, 24)
  assert.deepEqual(texts(figures[0], 'tbody td'), ['✓','✓','✓','✓','–','✓','$0','$24'])
  assert.deepEqual(texts(figures[4], 'tbody td'), ['.md','.svg','.tsx','✓','–','✓','–','–','✓'])
  assert.deepEqual(texts(figures[8], 'tbody td'), ['41','3','2','54'])
  assert.deepEqual(texts(figures[12], 'tbody td'), ['12','18','41','28','33','67','4','6','9'])
  assert.deepEqual(texts(figures[16], 'tbody tr:first-child td > [aria-hidden]'), ['·','░','░','▓','▒','░'])
  assert.deepEqual(texts(figures[20], 'tbody tr:first-child td > [aria-hidden]'), ['█','▓','▒','░'])
  assert.equal(figures[20].querySelector('.justify-between'), null)
  assert.deepEqual(texts(figures[16], 'tbody tr:first-child td .sr-only'), ['0 0','4 1','8 4','12 8','16 6','20 1'])
})
test('compiler, runtime, props and items share visible native DOM and caption labels', () => {
  const ids = new Set()
  const normalized = figures.map(f => {
    const caption = f.querySelector('figcaption')
    assert.ok(caption.id && !ids.has(caption.id)); ids.add(caption.id)
    assert.equal(f.querySelector('[role=region]').getAttribute('aria-labelledby'), caption.id)
    assert.equal(f.querySelector('[role=region]').getAttribute('tabindex'), '0')
    assert.equal(f.querySelector('table').getAttribute('aria-labelledby'), caption.id)
    assert.ok(f.querySelector('th[scope=col]') && f.querySelector('th[scope=row]'))
    assert.doesNotMatch(f.outerHTML, /opacity:\s*0(?:;|"|$)|translateY/)
    const clone = f.cloneNode(true), walker = doc.createTreeWalker(clone, 128), comments = []
    while (walker.nextNode()) comments.push(walker.currentNode)
    comments.forEach(n => n.remove())
    return clone.outerHTML.replaceAll(caption.id, 'caption')
  })
  for (let i = 0; i < 24; i += 4) for (let j = 1; j < 4; j++) assert.equal(normalized[i+j], normalized[i])
})
test('all three component documentation pages render both upstream examples', () => {
  for (const slug of ['graph-compare','graph-matrix','graph-heatmap']) {
    const page = new JSDOM(readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`, import.meta.url), 'utf8')).window.document
    assert.equal(page.querySelectorAll('figure').length, 2)
    assert.doesNotMatch(page.querySelector('.vp-doc').innerHTML, /<(?:GraphCompare|GraphMatrix|GraphHeatmap|Col|Row)\b/)
  }
})
