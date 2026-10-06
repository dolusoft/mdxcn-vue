import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { createMarkdownRenderer, resolveConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'

const vueRequire = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = vueRequire('jsdom')
const root = fileURLToPath(new URL('../', import.meta.url))
const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/prose-terminal.html', import.meta.url), 'utf8')).window.document
const figures = [...doc.querySelectorAll('figure')]
const texts = (figure, selector) => [...figure.querySelectorAll(selector)].map((node) => node.textContent)

test('compiled and prop Callout paths match independent upstream content and classes', () => {
  assert.equal(figures.length, 7)
  for (const figure of figures.slice(0, 2)) {
    assert.equal(figure.getAttribute('role'), 'note')
    assert.deepEqual(texts(figure, 'figcaption'), ['[ warning ]'])
    assert.deepEqual(texts(figure, '.grid > span'), ['!'])
    assert.equal(figure.querySelector('.grid > span').getAttribute('aria-hidden'), 'true')
    assert.deepEqual(texts(figure, 'p'), ['The CLI copies files into registry/default. It does not add an npm dependency, so there is nothing to update later — edit the source.'])
    assert.deepEqual(texts(figure, 'strong'), ['registry/default'])
    assert.equal(figure.querySelector('figure > div').className, 'min-w-0 px-5 sm:px-8 py-6 sm:py-6')
  }
})
test('compiled and prop Quote paths match independent attribution and rich body', () => {
  for (const figure of figures.slice(2, 4)) {
    assert.equal(figure.querySelector('figcaption'), null)
    assert.deepEqual(texts(figure, 'p'), ['A thousand barely audible voices all singing in tune.'])
    assert.deepEqual(texts(figure, 'em'), ['tune'])
    assert.deepEqual(texts(figure, 'cite'), ['Paul Graham'])
    assert.deepEqual(texts(figure, 'footer .text-graph-muted'), ['Taste for Makers'])
    assert.equal(figure.querySelector('blockquote').className, 'm-0 flex flex-col gap-5 p-0')
    assert.equal(figure.querySelector('.graph-rule').getAttribute('aria-hidden'), 'true')
  }
})
test('console compilation, text props and explicit highlighted fences match independent terminal lines', () => {
  for (const figure of figures.slice(4)) {
    assert.deepEqual(texts(figure, 'figcaption'), ['[ shell ]'])
    assert.deepEqual(texts(figure, 'pre > code > span:last-child'), [
      'pnpm dlx shadcn@latest add @mdxcn/callout',
      '✓ registry/default/callout/callout.tsx',
      '✓ registry/default/graph-frame/graph-frame.tsx',
      '  2 files written, 0 conflicts',
    ])
    assert.deepEqual(texts(figure, 'pre > code > span:first-child'), ['$', ' ', ' ', ' '])
    assert.equal(figure.querySelectorAll('button.copy, span.lang, figure').length, 0)
    assert.equal(figure.querySelectorAll('pre').length, 1)
  }
})
test('all three paths have equal DOM, visible SSR and valid unique caption references', () => {
  const ids = new Set()
  const normalize = (figure) => {
    assert.doesNotMatch(figure.outerHTML, /opacity:\s*0|translateY/)
    const caption = figure.querySelector('figcaption')
    if (caption) {
      assert.ok(caption.id)
      assert.ok(!ids.has(caption.id))
      ids.add(caption.id)
      assert.equal(figure.getAttribute('aria-labelledby'), caption.id)
    }
    const clone = figure.cloneNode(true)
    const walker = doc.createTreeWalker(clone, 128)
    const comments = []
    while (walker.nextNode()) comments.push(walker.currentNode)
    comments.forEach((node) => node.remove())
    return caption ? clone.outerHTML.replaceAll(caption.id, 'caption') : clone.outerHTML
  }
  const actual = figures.map(normalize)
  for (const [first, second] of [[0, 1], [2, 3], [4, 5], [4, 6]]) assert.equal(actual[first], actual[second])
})
test('real docs config upgrades the three new pages and keeps explicit terminal fences', async () => {
  const config = await resolveConfig(root, 'build')
  const md = await createMarkdownRenderer(root, config.markdown)
  for (const [slug, name] of [['callout', 'Callout'], ['quote', 'Quote'], ['terminal', 'Terminal']]) {
    const source = readFileSync(new URL(`../components/${slug}.md`, import.meta.url), 'utf8')
    const output = await md.renderAsync(source, { path: `components/${slug}.md` })
    assert.ok(output.includes(`<${name} v-bind=`))
    const html = readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`, import.meta.url), 'utf8')
    const page = new JSDOM(html).window.document
    assert.equal(page.querySelectorAll('figure').length, 3)
    assert.equal(page.querySelectorAll('figure figure').length, 0)
    assert.doesNotMatch(html, /<(?:Callout|Quote|Terminal)\b/)
  }
})
