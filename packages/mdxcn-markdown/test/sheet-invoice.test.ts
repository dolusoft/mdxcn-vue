import MarkdownIt from 'markdown-it'
import { expect, it } from 'vitest'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { ComponentName, MarkdownWarning } from '../src'
import examples from '../../mdxcn-vue/test/fixtures/sheet-invoice-examples.json'

it.each(examples)('$name $props.title compiles the independently recorded upstream model', (c) => {
  const md = new MarkdownIt()
  expect(
    JSON.parse(JSON.stringify(tokensToProps(c.name as ComponentName, md.parse(c.body, {}), md))),
  ).toEqual(c.model)
  const warnings: MarkdownWarning[] = []
  const compiler = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w) => warnings.push(w),
  })
  expect(compiler.render(c.source)).toContain('v-bind=')
  expect(warnings).toEqual([])
})
it.each(['GraphSheet', 'GraphInvoice'] as const)(
  '%s explicit data preserves runtime field precedence',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
    expect(
      md.render(
        `<${name} title="T" :${name === 'GraphSheet' ? 'sections' : 'items'}="[]">\n\n| A | B |\n| --- | --- |\n| x | 0 |\n\n</${name}>`,
      ),
    ).not.toContain('v-bind=')
    expect(warnings[0]?.reason).toContain('Explicit data props')
  },
)
it.each(['GraphCompare', 'GraphMatrix', 'GraphHeatmap'] as const)(
  '%s malformed body names the actual component',
  (name) => {
    const md = new MarkdownIt()
    expect(() => tokensToProps(name, md.parse('ordinary paragraph', {}), md)).toThrow(
      `${name} requires one Markdown table`,
    )
    const warnings: MarkdownWarning[] = []
    new MarkdownIt({ html: true })
      .use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
      .render(`<${name} title="T">\n\nordinary paragraph\n\n</${name}>`)
    expect(warnings[0]?.reason).toBe(`${name} requires one Markdown table`)
  },
)
it.each(['Total', '**Due**'])('Sheet and Invoice discard detected %s footer', (label) => {
  const md = new MarkdownIt()
  const table = `| Description | Amount |\n| --- | --- |\n| Item | 1 |\n| ${label} | 2 |`
  expect(tokensToProps('GraphSheet', md.parse('### S\n\n' + table, {}), md)).toMatchObject({
    sections: [{ title: 'S', rows: [['Item', '1']] }],
    footer: undefined,
  })
  expect(tokensToProps('GraphInvoice', md.parse(table, {}), md)).toMatchObject({
    items: [{ description: 'Item', amount: '1' }],
    totals: [],
  })
})
it('Invoice retains numeric literals and bold paragraph totals without currency conversion', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'GraphInvoice',
      md.parse('**Subtotal** -1,234.50\n\nTax 0\n\nDue −12.75\n\nNaN\n\n$5', {}),
      md,
    ),
  ).toEqual({
    meta: [],
    items: [],
    totals: [
      { label: 'Subtotal', value: '-1,234.50', accent: true },
      { label: 'Tax', value: '0', accent: false },
      { label: 'Due', value: '−12.75', accent: false },
    ],
    note: 'NaN',
  })
})
it('Sheet uses only its first section headers and ignores leading or nested headings', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'GraphSheet',
      md.parse('ignored\n\n# Empty\n\n### Last\n\n| A | B |\n| --- | --- |\n| x | 0 |', {}),
      md,
    ),
  ).toMatchObject({
    headers: [],
    sections: [
      { title: 'Empty', rows: [] },
      { title: 'Last', rows: [['x', '0']] },
    ],
  })
})
