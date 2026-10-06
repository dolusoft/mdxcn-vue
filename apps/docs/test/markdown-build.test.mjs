import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createMarkdownRenderer, resolveConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'

const vueRequire = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = vueRequire('jsdom')
const root = fileURLToPath(new URL('../', import.meta.url))

test('docs config compiles real page examples before highlighter and anchor output', async () => {
  const config = await resolveConfig(root, 'build')
  const md = await createMarkdownRenderer(root, config.markdown)
  for (const [name, component, count] of [['graph-stack', 'GraphStack', 3], ['graph-table', 'GraphTable', 2], ['endpoint', 'Endpoint', 1]]) {
    const source = readFileSync(new URL(`../components/${name}.md`, import.meta.url), 'utf8')
    const output = await md.renderAsync(source, { path: `components/${name}.md` })
    assert.equal((output.match(new RegExp(`<${component} v-bind=`, 'g')) ?? []).length, count)
  }
})

const built = readFileSync(new URL('../.vitepress/dist/test/fixtures/compiler.html', import.meta.url), 'utf8')
const document = new JSDOM(built).window.document
const figures = [...document.querySelectorAll('figure')]
const texts = (figure, selector) => [...figure.querySelectorAll(selector)].map((node) => node.textContent)
const target = '/components/graph-table.html'

test('compiled and runtime stack DOM each match an independent expected fixture', () => {
  assert.equal(figures.length, 6)
  for (const index of [0, 3]) {
    const figure = figures[index]
    assert.deepEqual(texts(figure, 'li[aria-label] > span:first-child'), ['Web app ui docs'])
    assert.deepEqual(texts(figure, 'li[aria-label] strong'), ['Web'])
    assert.deepEqual(texts(figure, 'li[aria-label] em'), ['app'])
    assert.deepEqual(texts(figure, 'li[aria-label] code'), ['ui'])
    assert.equal(figure.querySelector('a').getAttribute('href'), target)
    assert.equal(figure.querySelector('li[aria-label]').getAttribute('aria-label'), 'Web app ui docs: js 2, css 1')
    assert.deepEqual(texts(figure, 'li[aria-label] span[aria-hidden] > span'), ['█', '█', '▓'])
    assert.deepEqual(texts(figure, 'ul:last-child li > span:last-child'), ['js', 'css'])
  }
})

test('compiled and runtime table DOM each match independent cells, footer and alignment', () => {
  for (const index of [1, 4]) {
    const figure = figures[index]
    assert.deepEqual(texts(figure, 'th[scope]'), ['Name', 'Count'])
    assert.deepEqual(texts(figure, 'tbody td'), ['Web', '2', 'Docs', '3'])
    assert.deepEqual(texts(figure, 'tfoot tr:last-child td'), ['Sum', '5'])
    assert.deepEqual(texts(figure, 'tbody em'), ['Web'])
    assert.deepEqual(texts(figure, 'tbody code'), ['2'])
    assert.deepEqual(texts(figure, 'tfoot strong'), ['Sum'])
    assert.equal(figure.querySelector('tbody a').getAttribute('href'), target)
    for (const row of figure.querySelectorAll('tbody tr, tfoot tr:last-child')) {
      assert.ok(row.children[0].classList.contains('text-left'))
      assert.ok(row.children[1].classList.contains('text-right'))
    }
  }
})

test('compiled and runtime Endpoint DOM each match independent prose and whitespace-sensitive code', () => {
  for (const index of [2, 5]) {
    const figure = figures[index]
    assert.equal(figure.querySelector('p').textContent, 'POST/api/test')
    assert.deepEqual(texts(figure, 'p strong'), ['docs'])
    assert.equal(figure.querySelector('p a').getAttribute('href'), target)
    assert.deepEqual(texts(figure, 'li > span:nth-child(2)'), ['id (required)', 'empty'])
    assert.deepEqual(texts(figure, 'li code'), ['slug'])
    assert.deepEqual(texts(figure, 'li em'), ['web'])
    assert.equal(figure.querySelectorAll('li')[1].children.length, 3)
    assert.deepEqual(texts(figure, 'pre code'), ['  curl /api/test', '  { "ok": true }\n'])
    assert.equal(figure.querySelectorAll('pre').length, 2)
    assert.equal(figure.querySelectorAll('button.copy, span.lang').length, 0)
  }
})

test('both paths produce identical DOM and valid unique caption references', () => {
  assert.equal(figures.length, 6)
  const ids = new Set()
  const normalized = figures.map((figure) => {
    const caption = figure.querySelector('figcaption')
    assert.ok(caption.id)
    assert.ok(!ids.has(caption.id))
    ids.add(caption.id)
    for (const element of figure.querySelectorAll('[aria-labelledby]')) assert.equal(element.getAttribute('aria-labelledby'), caption.id)
    for (const region of figure.querySelectorAll('[role="region"]')) assert.equal(region.getAttribute('tabindex'), '0')
    const clone = figure.cloneNode(true)
    const walker = document.createTreeWalker(clone, 128)
    const comments = []
    while (walker.nextNode()) comments.push(walker.currentNode)
    comments.forEach((node) => node.remove())
    return clone.outerHTML.replaceAll(caption.id, 'caption')
  })
  for (let index = 0; index < 3; index++) assert.equal(normalized[index], normalized[index + 3])
})
