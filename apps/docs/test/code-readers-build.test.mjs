import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const vueRequire = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = vueRequire('jsdom')
const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/code-readers.html', import.meta.url), 'utf8')).window.document
const figures = [...doc.querySelectorAll('figure')]
const texts = (figure, selector) => [...figure.querySelectorAll(selector)].map((node) => node.textContent)

test('Annotate compiler, props and highlighted fallback match independent upstream lines and notes', () => {
  assert.equal(figures.length, 8)
  for (const figure of figures.slice(0, 3)) {
    assert.deepEqual(texts(figure, 'figcaption'), ['[ python ]'])
    assert.deepEqual(texts(figure, 'pre code > span:last-child'), ['def fetch(url, times=3):', '    return get(url)'])
    assert.deepEqual(texts(figure, 'pre code > span:first-child'), ['[1]', ' '])
    assert.deepEqual(texts(figure, 'li > span'), ['[1]'])
    assert.equal(figure.querySelector('ol').getAttribute('role'), 'list')
    assert.deepEqual(texts(figure, 'li > div'), ['Three tries.'])
    assert.deepEqual(texts(figure, 'strong'), ['tries'])
    assert.equal(figure.querySelector('pre code').className, 'grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 text-foreground')
    assert.equal(figure.querySelector('.graph-rule').getAttribute('aria-hidden'), 'true')
  }
})
test('Env fence, props and highlighted fallback match independent required/empty values', () => {
  for (const figure of figures.slice(3, 6)) {
    assert.deepEqual(texts(figure, 'figcaption'), ['[ .env ]'])
    assert.deepEqual(texts(figure, 'li > span:nth-child(2)'), ['DATABASE_URL (required)', 'ANALYTICS_ID'])
    assert.deepEqual(texts(figure, 'li > span:nth-child(3)'), ['postgres://localhost:5432/app', '—'])
    assert.deepEqual(texts(figure, 'li > span:nth-child(4)'), ['Postgres connection string.'])
    assert.equal(figure.querySelector('p').getAttribute('aria-hidden'), 'true')
    assert.equal(figure.querySelector('li > span').getAttribute('aria-hidden'), 'true')
    assert.equal(figure.querySelector('ul').getAttribute('role'), 'list')
  }
})
test('Env list and data paths match the upstream worker example', () => {
  for (const figure of figures.slice(6)) {
    assert.deepEqual(texts(figure, 'figcaption'), ['[ WORKER ]'])
    assert.deepEqual(texts(figure, 'li > span:nth-child(2)'), ['QUEUE_URL (required)', 'CONCURRENCY'])
    assert.deepEqual(texts(figure, 'li > span:nth-child(3)'), ['redis://localhost:6379', '4'])
    assert.deepEqual(texts(figure, 'li > span:nth-child(4)'), ['jobs and retries', 'per process'])
  }
})
test('code-reader paths have identical visible SSR DOM and unique caption relations', () => {
  const ids = new Set()
  const normalized = figures.map((figure) => {
    assert.doesNotMatch(figure.outerHTML, /opacity:\s*0|translateY/)
    assert.equal(figure.querySelectorAll('button.copy, span.lang, figure').length, 0)
    const caption = figure.querySelector('figcaption')
    assert.ok(caption.id && !ids.has(caption.id))
    ids.add(caption.id)
    assert.equal(figure.getAttribute('aria-labelledby'), caption.id)
    const clone = figure.cloneNode(true)
    const walker = doc.createTreeWalker(clone, 128)
    const comments = []
    while (walker.nextNode()) comments.push(walker.currentNode)
    comments.forEach((node) => node.remove())
    return clone.outerHTML.replaceAll(caption.id, 'caption')
  })
  for (const [first, second] of [[0, 1], [0, 2], [3, 4], [3, 5], [6, 7]]) assert.equal(normalized[first], normalized[second])
})
test('new docs pages render all examples without nested or unresolved readers', () => {
  for (const slug of ['annotate', 'env']) {
    const html = readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`, import.meta.url), 'utf8')
    const doc = new JSDOM(html).window.document
    assert.equal(doc.querySelectorAll('figure').length, 3)
    assert.equal(doc.querySelectorAll('figure figure').length, 0)
    assert.doesNotMatch(html, /<(?:Annotate|Env)\b/)
  }
})
