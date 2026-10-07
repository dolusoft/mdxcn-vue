import MarkdownIt from 'markdown-it'
import { createMarkdownRenderer, disposeMdItInstance } from 'vitepress'
import { expect, it } from 'vitest'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { ComponentName, MarkdownWarning } from '../src'
import fixtures from '../../mdxcn-vue/test/fixtures/grid-fraction-examples.json'
it.each(fixtures.filter((c) => c.body))(
  '$name $props.title compiles independent upstream example in VitePress',
  async (c) => {
    const warnings: MarkdownWarning[] = []
    const md = await createMarkdownRenderer('.', {
      config: (md) => {
        md.use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
      },
    })
    try {
      expect(
        JSON.parse(
          JSON.stringify(tokensToProps(c.name as ComponentName, md.parse(c.body!, {}), md)),
        ),
      ).toEqual(c.model)
      expect(md.render(`<${c.name} title="T">\n\n${c.body}\n\n</${c.name}>`)).toContain('v-bind=')
      expect(warnings).toEqual([])
    } finally {
      disposeMdItInstance()
    }
  },
)
it.each(['GraphCells', 'GraphMeter', 'GraphWaffle'] as const)('%s compiles empty input', (name) => {
  expect(tokensToProps(name, [], new MarkdownIt())).toEqual(
    name === 'GraphCells' ? { items: [] } : { written: { token: '', caption: undefined } },
  )
})
it.each([
  ['GraphCells', 'items'],
  ['GraphMeter', 'value'],
  ['GraphMeter', 'caption'],
  ['GraphMeter', 'written'],
  ['GraphWaffle', 'value'],
  ['GraphWaffle', 'caption'],
  ['GraphWaffle', 'written'],
] as const)('%s explicit %s retains runtime precedence', (name, field) => {
  const warnings: MarkdownWarning[] = [],
    md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
  expect(
    md.render(`<${name} title="T" :${field}="null">\n\n67% — caption\n\n</${name}>`),
  ).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
it.each(['GraphCells', 'GraphMeter', 'GraphWaffle'] as const)(
  '%s unsupported fences and Grid markers fall back explicitly',
  (name) => {
    for (const body of ['```txt\n1\n```', '<Grid label="r">1</Grid>']) {
      const warnings: MarkdownWarning[] = [],
        md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
      expect(md.render(`<${name} title="T">\n\n${body}\n\n</${name}>`)).not.toContain('v-bind=')
      expect(warnings).toHaveLength(1)
    }
  },
)
it.each(['GraphMeter', 'GraphWaffle'] as const)(
  '%s joins softbreaks and multiple spaces without losing emphasis',
  (name) => {
    const md = new MarkdownIt()
    expect(tokensToProps(name, md.parse('**67%**   — disk\nusage', {}), md)).toEqual({
      written: { token: '67%', caption: 'disk usage' },
    })
    expect(tokensToProps(name, md.parse('67%\n\ncaption', {}), md)).toEqual({
      written: { token: '67%caption', caption: undefined },
    })
  },
)
it('Cells ignores nested list text, normalizes softbreaks and does not expand runs', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'GraphCells',
      md.parse('- **row**: 1  0 /\n  0 1 NaN 2*3\n  - ignored: 0', {}),
      md,
    ),
  ).toEqual({
    items: [
      {
        label: 'row',
        cells: [
          [1, 0],
          [0, 1],
        ],
      },
    ],
  })
  expect(
    tokensToProps('GraphCells', md.parse('ignored\n\n- row: 1 -1 0.5 0x1\n- no colon', {}), md),
  ).toEqual({
    items: [
      { label: 'row', cells: [[1, -1, 0.5, 1]] },
      { label: 'no colon', cells: [] },
    ],
  })
})
it.each(['GraphMeter', 'GraphWaffle'] as const)(
  '%s follows Vue whitespace-only softbreak removal between inline elements',
  (name) => {
    const md = new MarkdownIt()
    expect(tokensToProps(name, md.parse('**67%**\n*used*', {}), md)).toEqual({
      written: { token: '67%used', caption: undefined },
    })
    expect(tokensToProps(name, md.parse('**67%**   *used*', {}), md)).toEqual({
      written: { token: '67%', caption: 'used' },
    })
  },
)
