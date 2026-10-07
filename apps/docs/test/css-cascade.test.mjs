import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
import { test } from 'node:test'

const viteRequire = createRequire(import.meta.resolve('vite'))
const postcss = viteRequire('postcss')
const { transform } = viteRequire('lightningcss')
const vueRequire = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = vueRequire('jsdom')

// :not() takes the specificity of its most specific argument; :where() takes zero.
function specificity(selector) {
  selector = selector.replace(/:where\([^)]*\)/g, '')
  selector = selector.replace(/:not\(([^)]*)\)/g, (_, args) => args.split(',').sort((a, b) => specificity(b) - specificity(a))[0])
  const ids = (selector.match(/#[\w-]+/g) ?? []).length
  const classes = (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? []).length
  const types = (selector.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|:{1,2}[\w-]+/g, '').match(/[a-z][\w-]*/gi) ?? []).length
  return ids * 10000 + classes * 100 + types
}

test('actual VitePress rules lose to graph resets and generated layered prose utilities', () => {
  const host = readFileSync(new URL('../node_modules/vitepress/dist/client/theme-default/styles/components/vp-doc.css', import.meta.url), 'utf8')
  const graph = readFileSync(new URL('../../../packages/mdxcn-vue/dist/graph.css', import.meta.url), 'utf8').split('@utility')[0]
  const assets = new URL('../.vitepress/dist/assets/', import.meta.url)
  const built = readdirSync(assets).filter((name) => name.endsWith('.css')).map((name) => readFileSync(new URL(name, assets), 'utf8')).join('\n')
  // Flatten real Tailwind nesting, retaining cascade layers.
  const compiled = transform({ filename: 'docs.css', code: Buffer.from(built), targets: { chrome: 100 << 16 } }).code.toString()
  const rules = []
  for (const source of [compiled, graph, host]) {
    postcss.parse(source).walkRules((rule) => {
      let layer = ''
      for (let parent = rule.parent; parent; parent = parent.parent)
        if (parent.type === 'atrule' && parent.name === 'layer') layer = parent.params
      // Only Tailwind layers from the build; host is deliberately loaded last.
      if (source === compiled && !layer) return
      for (const selector of rule.selectors) {
        const declarations = []
        rule.walkDecls((decl) => declarations.push([decl.prop, decl.value]))
        rules.push({ selector, layer, declarations, order: rules.length })
      }
    })
  }
  const html = readFileSync(new URL('../.vitepress/dist/components/endpoint.html', import.meta.url), 'utf8')
  const document = new JSDOM(html).window.document
  const prose = document.querySelector('figure .leading-relaxed')
  assert.ok(prose)
  prose.insertAdjacentHTML('beforeend', '<ul><li>one</li><li>two</li></ul><a data-cascade href="/docs"><code>code</code></a>')
  const resolve = (element, property, hover = false) => {
    const candidates = rules.flatMap((rule) => {
      try { if (!element.matches(hover ? rule.selector.replace(/:hover/g, '') : rule.selector)) return [] } catch { return [] }
      return rule.declarations.filter(([name]) => name === property ||
        (property.startsWith('padding-') && name === (['padding-top', 'padding-bottom'].includes(property) ? 'padding-block' : 'padding-inline')) ||
        ((property.startsWith('padding-') || property.startsWith('margin-')) && name === property.split('-')[0])
      ).map(([, value]) => ({ ...rule, value }))
    }).sort((a, b) => {
      const rank = (layer) => ({ base: 0, components: 1, utilities: 2, '': 3 })[layer] ?? -1
      return rank(b.layer) - rank(a.layer) || specificity(b.selector) - specificity(a.selector) || b.order - a.order
    })
    const winner = candidates[0]
    assert.ok(winner, `No declaration for ${property}`)
    return winner.value === 'revert-layer' ? candidates.find((candidate) => candidate.layer !== winner.layer) : winner
  }
  const ul = prose.querySelector('ul')
  const li = prose.querySelector('li + li')
  const a = prose.querySelector('a[data-cascade]')
  const code = a.querySelector('code')
  for (const [element, property] of [[ul, 'padding'], [ul, 'margin'], [ul, 'list-style']])
    assert.match(resolve(element, property).selector, /graph-frame/)
  assert.equal(resolve(li, 'padding-left').layer, 'utilities')
  assert.equal(resolve(ul, 'padding-left').layer, '')
  assert.equal(resolve(li, 'margin-top').layer, 'base')
  assert.equal(resolve(li, 'margin-top').value, '0')
  // Real compiled Chat utilities must survive the unlayered host reset.
  for (const [utility, amount] of [['mt-4', '4'], ['mt-1', '1']]) {
    li.className = utility
    const winner = resolve(li, 'margin-top')
    assert.equal(winner.layer, 'utilities')
    assert.equal(winner.value, amount === '1' ? 'var(--spacing)' : 'calc(var(--spacing) * 4)')
  }
  li.className = ''
  for (const slug of ['steps', 'changelog', 'decision', 'env', 'keys', 'graph-stack', 'graph-score', 'graph-rank', 'graph-funnel', 'graph-stat', 'graph-slope', 'graph-bullet', 'graph-gantt', 'graph-diff', 'graph-waterfall']) {
    const page = new JSDOM(readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`, import.meta.url), 'utf8')).window.document
    const siblings = [...page.querySelectorAll('figure li + li')]
    if (slug === 'keys') {
      assert.equal(page.querySelectorAll('figure li').length, 0)
      assert.ok(page.querySelectorAll('figure dl > div').length > 1)
      continue
    }
    assert.ok(siblings.length, `${slug} needs adjacent list rows`)
    for (const row of siblings) {
      const winner = resolve(row, 'margin-top')
      assert.equal(winner.layer, 'base', `${slug} must retain preflight spacing`)
      assert.equal(winner.value, '0')
    }
  }
  assert.equal(resolve(a, 'color').layer, 'utilities')
  assert.equal(resolve(a, 'text-underline-offset').layer, 'utilities')
  assert.equal(resolve(code, 'color').layer, 'utilities')
  assert.equal(resolve(code, 'font-weight').layer, 'utilities')
  assert.equal(resolve(prose.querySelector('p'), 'margin').layer, 'utilities')
  const timerHtml = readFileSync(new URL('../.vitepress/dist/components/graph-timer.html', import.meta.url), 'utf8')
  const timer = new JSDOM(timerHtml).window.document.querySelector('figure .tabular-nums')
  assert.equal(resolve(timer, 'line-height').layer, 'utilities')
  assert.equal(resolve(a, 'color', true).layer, 'utilities')
  const tableHtml = readFileSync(new URL('../.vitepress/dist/components/graph-table.html', import.meta.url), 'utf8')
  const table = new JSDOM(tableHtml).window.document.querySelector('figure table')
  const th = table.querySelector('th[scope]')
  const td = table.querySelector('tbody td')
  const foot = table.querySelector('tfoot tr:last-child td')
  for (const element of [th, td, foot]) {
    for (const [property, expected] of [['border', '0'], ['background', 'transparent'], ['font-size', 'inherit']]) {
      const winner = resolve(element, property)
      assert.equal(winner.layer, '')
      assert.match(winner.selector, /graph-frame/)
      assert.equal(winner.value, expected)
    }
  }
  for (const [element, padding] of [[th, '0 0.75rem 0.75rem'], [td, '0.625rem 0.75rem'], [foot, '0.25rem 0.75rem 0']])
    assert.equal(resolve(element, 'padding').value, padding)
  assert.equal(resolve(th, 'font-weight').value, '400')
  assert.equal(resolve(th, 'color').value, 'var(--foreground)')
  assert.equal(resolve(table.querySelector('th.text-right'), 'text-align').value, 'right')
  assert.equal(resolve(table.querySelector('thead tr[aria-hidden] th'), 'padding').value, '0')
  assert.equal(resolve(table.querySelector('tfoot tr[aria-hidden] td'), 'padding').value, '0.5rem 0 0.75rem')
  assert.equal(resolve(table, 'display').value, 'table')
  assert.equal(resolve(table, 'border-collapse').value, 'separate')
  assert.equal(resolve(table, 'border-spacing').value, '0')
  for (const slug of ['graph-compare', 'graph-matrix', 'graph-heatmap']) {
    const page = new JSDOM(readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`, import.meta.url), 'utf8')).window.document
    const labeled = page.querySelector('figure table')
    assert.equal(resolve(labeled, 'display').value, 'table')
    assert.equal(resolve(labeled, 'border-collapse').value, 'separate')
    assert.equal(resolve(labeled.querySelector('thead th[scope]:nth-child(2)'), 'color').layer, 'utilities')
    assert.equal(resolve(labeled.querySelector('thead th[scope]:nth-child(2)'), 'padding-bottom').layer, 'utilities')
    for (const element of [labeled.querySelector('tbody th'), labeled.querySelector('tbody td')]) {
      assert.equal(resolve(element, 'padding-top').layer, 'utilities')
      assert.equal(resolve(element, 'text-align').layer, 'utilities')
      assert.equal(resolve(element, 'border').value, '0')
      assert.equal(resolve(element, 'background').value, 'transparent')
    }
    const ink = slug === 'graph-heatmap' ? labeled.querySelector('tbody td > [aria-hidden]') : labeled.querySelector('tbody td')
    assert.equal(resolve(ink, 'color').layer, 'utilities')
    if (slug === 'graph-matrix') assert.equal(resolve(labeled.querySelector('thead tr[aria-hidden] th'), 'padding').value, '0')
  }
  assert.equal(resolve(code, 'color', true).layer, 'utilities')
  const quoteHtml = readFileSync(new URL('../.vitepress/dist/components/quote.html', import.meta.url), 'utf8')
  const quote = new JSDOM(quoteHtml).window.document.querySelector('figure blockquote')
  assert.equal(resolve(quote, 'margin').layer, 'utilities')
  assert.equal(resolve(quote, 'padding-left').layer, 'utilities')
  assert.equal(resolve(quote, 'border-left').value, '0')
  assert.equal(resolve(quote, 'color').value, 'inherit')
  assert.equal(resolve(quote, 'transition').value, 'none')
  for (const property of ['padding', 'background-color', 'border-radius', 'font-size']) {
    const winner = resolve(code, property)
    assert.ok(!winner || winner.layer, `${property} must not retain host prose styling`)
  }
})
