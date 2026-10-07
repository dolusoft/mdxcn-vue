import { expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { ComponentName, MarkdownWarning } from '../src'
import type { TableModel, CompareRow, MatrixRow, HeatRow } from 'mdxcn-vue/core'
import {
  resolveLabeledTable,
  compareFromTable,
  matrixFromTable,
  heatFromTable,
} from 'mdxcn-vue/core'
import examples from '../../mdxcn-vue/test/fixtures/labeled-table-examples.json'
const names = ['GraphCompare', 'GraphMatrix', 'GraphHeatmap'] as const
it.each(examples)('$name $props.title compiles independent upstream fixture models', (c) => {
  const md = new MarkdownIt()
  const result = tokensToProps(c.name as ComponentName, md.parse(c.body, {}), md) as {
    table: TableModel
  }
  expect(result.table.headers).toEqual(['', ...c.columns])
  expect(result.table.rows).toEqual(c.raw)
  const parse =
    c.name === 'GraphCompare'
      ? compareFromTable
      : c.name === 'GraphMatrix'
        ? matrixFromTable
        : heatFromTable
  expect(
    resolveLabeledTable<CompareRow | MatrixRow | HeatRow>(result, { rows: [] }, null, parse),
  ).toEqual({ columns: c.columns, rows: c.rows })
  const warnings: MarkdownWarning[] = []
  const compiler = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  expect(compiler.render(c.source)).toContain('v-bind=')
  expect(warnings).toEqual([])
})
it.each(names)('%s preserves rich plain text and the shared total-row rule', (name) => {
  const md = new MarkdownIt()
  const source = '| — | A | B |\n| --- | --- | --- |\n| **r** | `1` | 2 |\n| **Total** | 3 | 4 |'
  const { table } = tokensToProps(name, md.parse(source, {}), md) as { table: TableModel }
  expect(table.rows).toHaveLength(1)
  expect(table.footer).toEqual([
    [{ type: 'strong', children: [{ type: 'text', value: 'Total' }] }],
    '3',
    '4',
  ])
  expect(resolveLabeledTable({ table }, { rows: [] }, null, matrixFromTable)).toEqual({
    columns: ['A', 'B'],
    rows: [{ label: 'r', values: [1, 2] }],
  })
})
it.each(names)(
  '%s leaves dynamic, explicit and unsupported content on the runtime path',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (w: MarkdownWarning) => warnings.push(w),
    })
    for (const [attrs, body, reason] of [
      ['', '| | A |\n| --- | --- |\n| r | {{ value }} |', 'Dynamic Vue content'],
      [':columns="[]"', '| | A |\n| --- | --- |\n| r | 1 |', 'Explicit data props'],
      [':rows="[]"', '| | A |\n| --- | --- |\n| r | 1 |', 'Explicit data props'],
      [':table="model"', '| | A |\n| --- | --- |\n| r | 1 |', 'Explicit data props'],
      ['', '<Row label="r">1</Row>', 'Unsupported inline token'],
      ['', '- r: 1', 'requires one Markdown table'],
    ]) {
      warnings.length = 0
      expect(md.render(`<${name} ${attrs}>\n\n${body}\n\n</${name}>`)).not.toContain('v-bind=')
      expect(warnings[0]?.reason).toContain(reason)
    }
  },
)
it.each(names)(
  '%s compiles multiline openings and retains empty cells and first named header',
  (name) => {
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
    expect(
      md.render(
        `<${name}\n title="T">\n\n| Name | A | B |\n| --- | --- | --- |\n| r | | 2 |\n\n</${name}>`,
      ),
    ).toContain('v-bind=')
    const parser = new MarkdownIt()
    const { table } = tokensToProps(
      name,
      parser.parse('| Name | A | B |\n| --- | --- | --- |\n| r | | 2 |', {}),
      parser,
    ) as { table: TableModel }
    expect(table.rows).toEqual([['r', '', '2']])
    expect(resolveLabeledTable({ table }, { rows: [] }, null, compareFromTable).columns).toEqual([
      'Name',
      'A',
      'B',
    ])
  },
)
