import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const document = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/sections.html', import.meta.url), 'utf8')).window.document
const figures = [...document.querySelectorAll('figure')]

test('three upstream examples compile to the same DOM as runtime hosts and typed props', () => {
  assert.equal(figures.length, 9)
  const normalized = figures.map(figure => {
    assert.equal(figure.getAttribute('aria-labelledby'), figure.querySelector('figcaption').id)
    assert.doesNotMatch(figure.outerHTML, /opacity:\s*0(?:;|"|$)|translateY/)
    assert.equal(figure.querySelector('table, button, details, [aria-expanded]'), null)
    return figure.outerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/ id="[^"]*"/g, '').replace(/ aria-labelledby="[^"]*"/g, '')
  })
  for (let i=0;i<9;i+=3) for (let j=1;j<3;j++) assert.equal(normalized[i+j], normalized[i])
  assert.equal(new Set(figures.map(f => f.querySelector('figcaption').id)).size, 9)
})
test('FAQ answer prose and Board states, counts, labels and notes survive VitePress', () => {
  assert.deepEqual([...figures[0].querySelectorAll('ol > li .text-pretty')].map(n=>n.textContent), ['Is this an npm package?', 'Does it need MDX?', 'Why is my timeline empty?'])
  assert.equal(figures[0].querySelectorAll('code').length, 6)
  assert.equal(figures[0].querySelectorAll('ol > li > .graph-rule').length, 2)
  assert.equal(figures[3].querySelector('.sr-only').textContent, 'Shipped: 2, Now: 2, Later: 2. 6 items.')
  assert.equal(figures[6].querySelector('.sr-only').textContent, 'Todo: 1, Doing: 1, Done: 2. 4 items.')
  assert.deepEqual([...figures[3].querySelectorAll('section')].map(n=>n.getAttribute('aria-label')), ['Shipped','Now','Later'])
  assert.match(figures[3].textContent, /if someone asks twice/)
  assert.ok(figures[6].querySelector('li .text-graph-accent-2'))
})
test('both documentation pages render upstream examples with visible native semantics', () => {
  for(const [slug,count] of [['faq',1],['graph-board',2]]) {
    const page = new JSDOM(readFileSync(new URL(`../.vitepress/dist/docs/${slug}.html`, import.meta.url),'utf8')).window.document
    assert.equal(page.querySelectorAll('figure').length,count)
    assert.doesNotMatch(page.querySelector('.vp-doc').innerHTML, /<(?:Faq|GraphBoard)\b/)
  }
})
