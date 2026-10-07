import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const page = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/sheet-invoice.html', import.meta.url),'utf8')).window.document
const figures = [...page.querySelectorAll('figure')]
const normalize = f => f.outerHTML.replace(/<!--[\s\S]*?-->/g,'').replace(/ id="[^"]*"/g,'').replace(/ aria-labelledby="[^"]*"/g,'')
test('four upstream Sheet/Invoice examples have identical compiled and typed data DOM', () => {
  assert.equal(figures.length,8)
  for(let i=0;i<8;i+=2) assert.equal(normalize(figures[i]),normalize(figures[i+1]))
  assert.equal(figures[0].querySelectorAll('tbody').length,2)
  assert.equal(figures[4].querySelector('dd.text-graph-accent').textContent,'7,440')
  assert.equal(figures[6].querySelectorAll('thead tr:first-child th').length,2)
  assert.match(figures[6].textContent,/Registry install0/)
})
test('documentation renders all four examples without unresolved tags or hidden SSR', () => {
  for(const slug of ['graph-sheet','graph-invoice']) {
    const doc = new JSDOM(readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`,import.meta.url),'utf8')).window.document
    assert.equal(doc.querySelectorAll('figure').length,2)
    assert.doesNotMatch(doc.querySelector('.vp-doc').innerHTML,/<(?:GraphSheet|GraphInvoice)\b/)
    for(const f of doc.querySelectorAll('figure')) assert.doesNotMatch(f.outerHTML,/opacity:\s*0(?:;|"|$)|translateY/)
  }
})
