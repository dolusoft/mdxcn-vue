import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/gantt-diff-waterfall.html', import.meta.url), 'utf8')).window.document
const figures = [...doc.querySelectorAll('figure')]
const texts = (figure, selector) => [...figure.querySelectorAll(selector)].map(n => n.textContent)
test('seven upstream examples match independent Gantt geometry, Diff rewrites and Waterfall totals', () => {
  assert.equal(figures.length, 28)
  assert.deepEqual(texts(figures[0], 'li > span:nth-child(2)'), ['████████----------------','-----███████░░░░░░------','-------------██░░░░░░░--','--------------------████'])
  assert.deepEqual(texts(figures[0], '.justify-between > span'), ['q1','q2','q3','q4'])
  assert.equal(figures[0].querySelectorAll('li')[1].getAttribute('aria-label'), 'build from 20% to 75%, 55% complete')
  assert.deepEqual(texts(figures[4], 'li > span:nth-child(2)'), ['████████------------','-------█████████----','--------------██████'])
  assert.deepEqual(texts(figures[4], '.justify-between > span'), ['mon','wed','fri'])
  assert.deepEqual(texts(figures[8], 'li > div > span:last-child'), ['84 kb','31 kb','12 kb'])
  assert.deepEqual(texts(figures[8], 'li > div > span:first-child'), [' ','+','-'])
  assert.ok(figures[8].textContent.includes('shipped103 kb'))
  assert.deepEqual(texts(figures[12], 'li > div > span:last-child'), ['12','3','1'])
  assert.ok(figures[12].textContent.includes('now14'))
  assert.deepEqual(texts(figures[16], 'li > div > span:nth-child(2)'), ['config: next.config.js','config: next.config.ts','middleware: middleware.ts','middleware: proxy.ts','app'])
  assert.deepEqual(texts(figures[16], 'li > div > span:first-child'), ['-','+','-','+','+'])
  assert.deepEqual(texts(figures[20], 'li > div > span:nth-child(2)'), ['████████████████████████','---------------------███','-------------------██---','███████████████████-----'])
  assert.deepEqual(texts(figures[20], 'li > div > span:last-child'), ['48','−6','−4','38'])
  assert.equal(figures[20].querySelector('.sr-only').textContent, 'Revenue 48, Refunds −6, Hosting −4, Profit 38')
  assert.deepEqual(texts(figures[24], 'li > div > span:nth-child(2)'), ['██████████████████------','------------------██████','---------------------███','█████████████████████---'])
  assert.deepEqual(texts(figures[24], 'li > div > span:last-child'), ['12','+4','−2','14'])
  assert.equal(figures[24].querySelectorAll('li > .graph-rule').length, 1)
})
test('compiler, runtime, props and item paths produce equal visible DOM and unique captions', () => {
  const ids = new Set()
  const normalized = figures.map(f => {
    const caption = f.querySelector('figcaption')
    assert.ok(caption.id && !ids.has(caption.id)); ids.add(caption.id)
    assert.equal(f.getAttribute('aria-labelledby'), caption.id)
    assert.doesNotMatch(f.outerHTML, /opacity:\s*0(?:;|"|$)|translateY/)
    const clone = f.cloneNode(true), walker = doc.createTreeWalker(clone, 128), comments = []
    while (walker.nextNode()) comments.push(walker.currentNode)
    comments.forEach(n => n.remove())
    return clone.outerHTML.replaceAll(caption.id, 'caption')
  })
  for (let start = 0; start < 28; start += 4)
    for (let offset = 1; offset < 4; offset++) assert.equal(normalized[start + offset], normalized[start])
})
test('Gantt, Diff and Waterfall docs resolve every upstream example', () => {
  for (const [slug, count] of [['graph-gantt',2],['graph-diff',3],['graph-waterfall',2]]) {
    const page = new JSDOM(readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`, import.meta.url), 'utf8')).window.document
    assert.equal(page.querySelectorAll('figure').length, count)
    assert.doesNotMatch(page.querySelector('.vp-doc').innerHTML, /<(?:GraphGantt|GraphDiff|GraphWaterfall|Span|Line|Delta)\b/)
  }
})
