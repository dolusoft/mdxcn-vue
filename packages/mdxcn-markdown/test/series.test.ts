import MarkdownIt from 'markdown-it'
import { createMarkdownRenderer, disposeMdItInstance } from 'vitepress'
import { expect, it } from 'vitest'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { ComponentName, MarkdownWarning } from '../src'
import fixtures from '../../mdxcn-vue/test/fixtures/series-examples.json'
const written = fixtures.filter((c) => c.body)
const source = (c: (typeof fixtures)[number]) =>
  `<${c.name} ${Object.entries(c.props)
    .filter(([, v]) => typeof v === 'string')
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')}>\n\n${c.body}\n\n</${c.name}>`
it.each(written)('$name $props.title matches the independent upstream model', (c) => {
  const md = new MarkdownIt()
  expect(
    JSON.parse(JSON.stringify(tokensToProps(c.name as ComponentName, md.parse(c.body!, {}), md))),
  ).toEqual(c.model)
  const warnings: MarkdownWarning[] = []
  expect(
    new MarkdownIt({ html: true })
      .use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
      .render(source(c)),
  ).toContain('v-bind=')
  expect(warnings).toEqual([])
})
it.each(written)('$name $props.title compiles in real VitePress without fallback', async (c) => {
  const warnings: MarkdownWarning[] = []
  const md = await createMarkdownRenderer('.', {
    config: (md) => {
      md.use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
    },
  })
  try {
    expect(
      JSON.parse(JSON.stringify(tokensToProps(c.name as ComponentName, md.parse(c.body!, {}), md))),
    ).toEqual(c.model)
    expect(md.render(source(c))).toContain('v-bind=')
    expect(warnings).toEqual([])
  } finally {
    disposeMdItInstance()
  }
})
it.each(['GraphBars', 'GraphSpark'] as const)('%s compiles empty bodies', (name) => {
  const md = new MarkdownIt()
  expect(tokensToProps(name, [], md)).toEqual(
    name === 'GraphBars'
      ? { series: [] }
      : { written: { data: [], labels: [], caption: undefined } },
  )
})
it.each([
  ['GraphBars', 'from'],
  ['GraphBars', 'to'],
  ['GraphBars', 'series'],
  ['GraphSpark', 'data'],
  ['GraphSpark', 'caption'],
  ['GraphSpark', 'written'],
] as const)('%s explicit %s preserves runtime field precedence', (name, field) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
  expect(md.render(`<${name} title="T" :${field}="null">\n\n- A: 1 2\n\n</${name}>`)).not.toContain(
    'v-bind=',
  )
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
it.each(['GraphBars', 'GraphSpark'] as const)(
  '%s unsupported fences use warning and runtime fallback',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
    expect(md.render(`<${name} title="T">\n\n\`\`\`txt\n1 2\n\`\`\`\n\n</${name}>`)).not.toContain(
      'v-bind=',
    )
    expect(warnings).toHaveLength(1)
  },
)
it('Spark aligns kept list labels, drops invalid rows and does not use trailing caption', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'GraphSpark',
      md.parse('1. Mon: 12,400ms\n2. bad: no\n3. 3\n4. Tue: -4.5\n\n99 — ignored', {}),
      md,
    ),
  ).toEqual({ written: { data: [12400, 3, -4.5], labels: ['Mon', '', 'Tue'] } })
})
it('Spark source preserves emphasis delimiters and paragraph separators', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps('GraphSpark', md.parse('1 **2** *3*\n\n4 — **bold** [link](/)', {}), md),
  ).toEqual({ written: { data: [1, 4], labels: [], caption: '**bold** link' } })
})
it('Bars retains upstream concatenated loose paragraph text and descendant size emphasis', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps('GraphBars', md.parse('- A: 1\n\n  2\n\n  - **child**: 99', {}), md),
  ).toEqual({ series: [{ label: 'A', values: [12], size: 'lg' }] })
})
