import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { test } from 'node:test'
import { graphFilters } from 'mdxcn-vue/knap'

const dist = new URL('../.vitepress/dist/', import.meta.url)
const html = readFileSync(new URL('index.html', dist), 'utf8')
const base = process.env.MDXCN_PAGES === 'true' ? '/mdxcn-vue/' : '/'
const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

test('home renders populated Vue figures and genuine fenced filter output without a sidebar', () => {
  assert.match(html, /markdown-friendly/)
  assert.match(html, /pick a palette, copy the component/)
  assert.match(html, /one figure, two formats/)
  assert.match(html, /npm install mdxcn-vue mdxcn-markdown/)
  assert.equal((html.match(/role="tablist"/g) ?? []).length, 3)
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 6)
  assert.equal((html.match(/<figure\b/g) ?? []).length, 13)
  assert.doesNotMatch(html, /class="VPSidebar|<(?:Graph\w+|Faq)\b/)
  const expected = graphFilters.graph_meter(
    JSON.stringify({ title: 'SHIPPED', value: 0.67, ticks: 14, caption: '8 of 12 milestones' }),
  )
  assert.ok(html.includes(escape(expected)), 'same meter props produce the displayed Markdown')
  assert.match(html, /aria-label="copy install command"/)
  assert.match(html, /aria-label="accent color" class="[^"]*" role="radiogroup"/)
  assert.match(html, /Keshav Bagaade/)
  for (const id of ['shipped', 'bundle', 'reads']) {
    assert.ok(html.includes(`id="${id}-markdown-panel" hidden`))
    assert.ok(html.includes(`aria-controls="${id}-markdown-panel"`))
  }
})

test('home internal links and font preloads use the build base and resolve to emitted files', () => {
  const paths = [...html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)].map((match) => match[1])
  assert.ok(paths.length > 10)
  for (const path of paths) {
    assert.ok(path.startsWith(base), `missing base: ${path}`)
    assert.ok(!path.includes('/mdxcn-vue/mdxcn-vue/'), `duplicated base: ${path}`)
    const relative = path.slice(base.length)
    const file =
      relative === ''
        ? 'index.html'
        : /\.[a-z0-9]+$/i.test(relative)
          ? relative
          : `${relative}.html`
    assert.ok(existsSync(new URL(file, dist)), `missing output: ${file}`)
  }
  const fonts = [...html.matchAll(/<link\b[^>]*geist-mono[^>]*>/g)]
  assert.equal(fonts.length, 2)
})

test('all built pages keep absolute local URLs under the build base', () => {
  const pages = readdirSync(dist, { recursive: true }).filter((file) => file.endsWith('.html'))
  assert.ok(pages.length > 40)
  for (const page of pages) {
    const content = readFileSync(new URL(page.replaceAll('\\', '/'), dist), 'utf8')
    for (const match of content.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
      assert.ok(match[1].startsWith(base), `${page}: missing base in ${match[1]}`)
      assert.ok(!match[1].includes('/mdxcn-vue/mdxcn-vue/'), `${page}: duplicated base`)
    }
  }
  for (const [page, link] of [
    ['changelog', 'steps'],
    ['steps', 'terminal'],
  ]) {
    const content = readFileSync(new URL(`docs/${page}.html`, dist), 'utf8')
    assert.ok(content.includes(`href="./${link}.html"`))
    assert.ok(existsSync(new URL(`docs/${link}.html`, dist)))
  }
})
