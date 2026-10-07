import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const page = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/nested-flow.html', import.meta.url), 'utf8')).window.document
const figures = [...page.querySelectorAll('figure')]
const normalize = f => f.outerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/ id="[^"]*"/g, '').replace(/ aria-labelledby="[^"]*"/g, '')
test('loose, ordered, mixed-marker and heading paths retain equal compiler/runtime/data DOM', () => {
  const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/nested-flow-edges.html', import.meta.url), 'utf8')).window.document
  const figures = [...doc.querySelectorAll('figure')]
  assert.equal(figures.length, 12)
  for (let i=0;i<12;i+=3) {
    assert.equal(normalize(figures[i]), normalize(figures[i+1]))
    assert.equal(normalize(figures[i]), normalize(figures[i+2]))
    assert.doesNotMatch(figures[i+1].textContent, /\u200b/)
  }
  assert.match(figures[0].textContent, /first second/)
  assert.equal(figures[3].querySelector('.sr-only').textContent, '0 of 2 done')
  assert.equal(figures[6].querySelectorAll('.shrink-0.whitespace-nowrap').length, 2)
})
test('seven upstream examples have identical compiler, runtime and typed data DOM', () => {
  assert.equal(figures.length, 21)
  for (let i=0;i<21;i+=3) {
    assert.equal(normalize(figures[i]), normalize(figures[i+1]))
    assert.equal(normalize(figures[i]), normalize(figures[i+2]))
  }
  assert.deepEqual([...figures[0].querySelectorAll('li > span:first-child > span:first-child')].map(n=>n.textContent),['','├─ ','│  ├─ ','│  └─ ','└─ ','   └─ '])
  assert.equal(figures[12].querySelector('.sr-only').textContent,'2 of 5 done')
  assert.equal(figures[15].querySelectorAll('[aria-hidden="true"] > .shrink-0').length,4)
})
test('three docs pages render all seven examples visibly without unresolved tags', () => {
  for(const [slug,count] of [['graph-tree',2],['graph-check',3],['graph-flow',2]]) {
    const doc=new JSDOM(readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`,import.meta.url),'utf8')).window.document
    assert.equal(doc.querySelectorAll('figure').length,count)
    assert.doesNotMatch(doc.querySelector('.vp-doc').innerHTML,/<(?:GraphTree|GraphCheck|GraphFlow)\b/)
    for(const f of doc.querySelectorAll('figure')) assert.doesNotMatch(f.outerHTML,/opacity:\s*0(?:;|"|$)|translateY|header-anchor/)
  }
})
