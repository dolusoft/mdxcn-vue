import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const vueRequire = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = vueRequire('jsdom')
const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/state-list.html', import.meta.url), 'utf8')).window.document
const figures = [...doc.querySelectorAll('figure')]
const texts = (figure, selector) => [...figure.querySelectorAll(selector)].map(node => node.textContent)

test('loose Steps match the independent install fixture on all three paths', () => {
  assert.equal(figures.length, 11)
  for (const f of figures.slice(0, 3)) {
    assert.deepEqual(texts(f, 'li > div:first-child > span'), ['01', '02', '03'])
    assert.deepEqual(texts(f, 'li > div:first-child > div > p'), ['Copy the source', 'Register it', 'Write'])
    assert.deepEqual(texts(f, 'li > div:first-child > div > div > p'), ['Run the shadcn CLI. Files land under registry/default.', 'Export the component from mdx-components.tsx.', 'Use it between paragraphs. No import line.'])
    assert.equal(f.querySelectorAll('li > div:nth-child(2)[aria-hidden="true"]').length, 2)
    assert.equal(f.querySelector('ol').getAttribute('role'), 'list')
  }
})
test('tight Steps match the independent runbook on Markdown and item paths', () => {
  for (const f of figures.slice(3, 5)) {
    assert.deepEqual(texts(f, 'li > div:first-child > div > p'), ['Flip the flag', 'Watch p95', 'Write it down'])
    assert.deepEqual(texts(f, 'li > div:first-child > div > div'), ['cache.v2 to off in the dashboard.', 'Two minutes. It should drop under 300ms.', 'Open the postmortem before you leave.'])
    assert.equal(f.querySelectorAll('li > div > div > div p').length, 0)
  }
})
test('Changelog matches independent release glyphs, labels and content on all paths', () => {
  for (const f of figures.slice(5, 8)) {
    assert.deepEqual(texts(f, 'li > span:first-child'), ['+', '~', '*', '-'])
    assert.deepEqual(texts(f, 'li > span:nth-child(2)'), ['added', 'changed', 'fixed', 'removed'])
    assert.deepEqual(texts(f, 'li > div'), ['Callout, Quote, Steps, Terminal, Changelog', 'Graphs read MDX children as well as arrays', 'Timeline connector on Safari', 'The legacy accent prop'])
    assert.equal(f.querySelector('ul').getAttribute('role'), 'list')
  }
})
test('Decision matches independent database choices, prose and summary on all paths', () => {
  for (const f of figures.slice(8)) {
    assert.deepEqual(texts(f, 'li > span:first-child'), ['●', '×', '○'])
    assert.deepEqual(texts(f, 'li > span:nth-child(2)'), ['Postgres', 'Mongo', 'SQLite'])
    assert.deepEqual(texts(f, 'li > span:nth-child(3)'), ['boring, and we already run it', 'no joins we trust', 'fine until the second writer'])
    assert.equal(f.querySelector('.sr-only').textContent, 'Chose Postgres over 2 other options.')
    assert.equal(f.querySelector('p code').textContent, '2k')
  }
})
test('state-list SSR DOM is visible, caption ids are unique, and equivalent paths match exactly', () => {
  const ids = new Set()
  const normalized = figures.map(f => {
    assert.doesNotMatch(f.outerHTML, /opacity:\s*0|translateY/)
    assert.equal(f.querySelectorAll('figure').length, 0)
    const caption = f.querySelector('figcaption')
    assert.ok(caption.id && !ids.has(caption.id))
    ids.add(caption.id)
    assert.equal(f.getAttribute('aria-labelledby'), caption.id)
    const clone = f.cloneNode(true)
    const walker = doc.createTreeWalker(clone, 128)
    const comments = []
    while (walker.nextNode()) comments.push(walker.currentNode)
    comments.forEach(node => node.remove())
    return clone.outerHTML.replaceAll(caption.id, 'caption')
  })
  for (const [a,b] of [[0,1],[0,2],[3,4],[5,6],[5,7],[8,9],[8,10]]) assert.equal(normalized[a], normalized[b])
})
test('new component docs render all three examples without unresolved components', () => {
  for (const slug of ['steps', 'changelog', 'decision']) {
    const html = readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`, import.meta.url), 'utf8')
    const doc = new JSDOM(html).window.document
    assert.equal(doc.querySelectorAll('figure').length, 3)
    assert.equal(doc.querySelectorAll('figure figure').length, 0)
    assert.doesNotMatch(html, /<(?:Steps|Step|Changelog|Change|Decision)\b/)
  }
})
