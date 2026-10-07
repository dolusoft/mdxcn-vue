import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const page = (slug) => new JSDOM(readFileSync(new URL(`../.vitepress/dist/${slug}.html`, import.meta.url), 'utf8')).window.document
const normalize = (f) => f.outerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/ id="[^"]*"/g, '').replace(/ aria-labelledby="[^"]*"/g, '')
test('Grid/fraction production compiler, runtime and direct props produce equal DOM including softbreaks', () => {
  const figures = [...page('test/fixtures/grid-fraction').querySelectorAll('figure')]
  assert.equal(figures.length, 27)
  for(let i=0;i<figures.length;i+=3) {
    assert.equal(normalize(figures[i]),normalize(figures[i+1]))
    assert.equal(normalize(figures[i]),normalize(figures[i+2]))
    assert.doesNotMatch(figures[i+1].outerHTML,/header-anchor|opacity:0(?:;|"|$)|translateY/)
  }
  assert.equal(figures[6].querySelector('.sr-only').textContent,'78 percent of 500 GB')
  assert.equal(figures[9].querySelector('.sr-only').textContent,'91 percent. 182 of 200 green')
  assert.equal(figures[15].querySelector('.sr-only').textContent,'67 percent disk usage')
  assert.equal(figures[18].querySelector('.sr-only').textContent,'67 percent. disk usage')
})
test('Grid/fraction docs render eight upstream examples visibly with correct default track sizes', () => {
  for(const [slug,count] of [['graph-cells',2],['graph-meter',3],['graph-waffle',3]]) {
    const figures=[...page(`components/${slug}`).querySelectorAll('figure')]
    assert.equal(figures.length,count)
    for(const f of figures) assert.doesNotMatch(f.outerHTML,/header-anchor|opacity:0(?:;|"|$)|translateY|<(?:GraphCells|GraphMeter|GraphWaffle)\b/)
    if(slug==='graph-meter') assert.equal(figures[0].querySelectorAll('.block.w-full').length,14)
    if(slug==='graph-waffle') {
      assert.equal(figures[0].querySelectorAll('[aria-hidden="true"] span').length,100)
      assert.equal(figures[2].querySelectorAll('[aria-hidden="true"] span').length,40)
    }
  }
})
