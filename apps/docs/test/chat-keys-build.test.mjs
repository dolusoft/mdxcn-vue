import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const vueRequire = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = vueRequire('jsdom')
const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/chat-keys.html', import.meta.url), 'utf8')).window.document
const figures = [...doc.querySelectorAll('figure')]
const texts = (f, selector) => [...f.querySelectorAll(selector)].map(n => n.textContent)

test('session matches independent upstream messages, prompt and a11y across three paths', () => {
  assert.equal(figures.length, 8)
  for (const f of figures.slice(0, 3)) {
    assert.deepEqual(texts(f, 'li > div'), ['which graph shows a rollback?', 'Timeline. Bold the row where you rolled back.', 'reads graph-timeline.tsx', 'Then Diff for what the rollback changed.', 'and on GitHub?', 'Paste the fenced ASCII. GitHub does not run MDX.'])
    assert.deepEqual(texts(f, 'li > span:first-child'), ['>', ' ', ' ', ' ', '>', ' '])
    assert.deepEqual(texts(f, 'li > span:nth-child(2) .sr-only'), ['agent', 'agent'])
    assert.equal(f.querySelector('ol').getAttribute('role'), 'list')
    assert.equal(f.querySelectorAll('li > span[aria-hidden="true"]').length, 6)
    assert.ok(f.querySelectorAll('li > div')[2].classList.contains('text-graph-muted'))
  }
})
test('loose support thread preserves independent code and paragraph content on both paths', () => {
  for (const f of figures.slice(3, 5)) {
    assert.deepEqual(texts(f, 'li > div'), ['the timeline renders empty in our docs', 'Do you swap li in mdx-components?Wrap the map in withMdxcn and the graphs see list items again.', 'that was it'])
    assert.deepEqual(texts(f, 'li code'), ['li', 'withMdxcn'])
    assert.deepEqual(texts(f, 'li p'), ['Wrap the map in withMdxcn and the graphs see list items again.'])
  }
})
test('shortcuts match independent modifier caps, descriptions and accessible names on three paths', () => {
  for (const f of figures.slice(5)) {
    assert.deepEqual(texts(f, 'dt > .sr-only'), ['⌘K', '⌘⇧C', 'Ctrl+Shift+P', 'g then d', 'Esc'])
    assert.deepEqual(texts(f, 'dd'), ['search the docs', 'copy the page as Markdown', 'command palette', 'go to docs', 'close'])
    assert.deepEqual(texts(f, 'dt .whitespace-nowrap'), ['[⌘]', '[K]', '[⌘]', '[⇧]', '[C]', '[Ctrl]', '[Shift]', '[P]', '[g]', '[d]', '[Esc]'])
    assert.equal(f.querySelector('dd').className, 'text-graph-accent')
    assert.equal(f.querySelectorAll('dt > span[aria-hidden="true"]').length, 6)
  }
})
test('Chat and Keys paths produce identical visible SSR DOM and unique caption associations', () => {
  const ids = new Set()
  const normalized = figures.map(f => {
    assert.doesNotMatch(f.outerHTML, /opacity:\s*0|translateY/)
    assert.equal(f.querySelectorAll('figure').length, 0)
    const caption = f.querySelector('figcaption')
    assert.ok(caption.id && !ids.has(caption.id)); ids.add(caption.id)
    assert.equal(f.getAttribute('aria-labelledby'), caption.id)
    const clone = f.cloneNode(true)
    const walker = doc.createTreeWalker(clone, 128)
    const comments = []
    while (walker.nextNode()) comments.push(walker.currentNode)
    comments.forEach(node => node.remove())
    return clone.outerHTML.replaceAll(caption.id, 'caption')
  })
  for (const [a,b] of [[0,1],[0,2],[3,4],[5,6],[5,7]]) assert.equal(normalized[a], normalized[b])
})
test('Chat and Keys docs render all examples with resolved components', () => {
  for (const [slug, count] of [['chat', 3], ['keys', 2]]) {
    const html = readFileSync(new URL(`../.vitepress/dist/docs/${slug}.html`, import.meta.url), 'utf8')
    const doc = new JSDOM(html).window.document
    assert.equal(doc.querySelectorAll('figure').length, count)
    assert.equal(doc.querySelectorAll('figure figure').length, 0)
    assert.doesNotMatch(html, /<(?:Chat|Keys)\b/)
  }
})
