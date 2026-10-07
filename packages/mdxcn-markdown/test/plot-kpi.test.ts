import MarkdownIt from 'markdown-it'
import { createMarkdownRenderer, disposeMdItInstance } from 'vitepress'
import { expect, it } from 'vitest'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { ComponentName, MarkdownWarning } from '../src'
import fixtures from '../../mdxcn-vue/test/fixtures/plot-kpi-examples.json'
it.each(fixtures.filter((c) => c.body))(
  '$name compiles the independent upstream example in VitePress',
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
it.each(['GraphPlot', 'GraphKpi'] as const)('%s compiles empty input', (name) => {
  expect(tokensToProps(name, [], new MarkdownIt())).toEqual({
    written:
      name === 'GraphPlot'
        ? { data: [], labels: [], caption: undefined }
        : { value: '', label: '', hint: undefined, data: [] },
  })
})
it.each([
  ['GraphPlot', 'data'],
  ['GraphPlot', 'labels'],
  ['GraphPlot', 'written'],
  ['GraphKpi', 'value'],
  ['GraphKpi', 'label'],
  ['GraphKpi', 'hint'],
  ['GraphKpi', 'data'],
  ['GraphKpi', 'written'],
] as const)('%s explicit %s retains runtime precedence', (name, field) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
  expect(
    md.render(`<${name} title="T" :${field}="null">\n\n12 reads — +2\n\n1 2\n\n</${name}>`),
  ).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
it('KPI parses visible emphasis, paragraph precedence, multiline and finite run tokens', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'GraphKpi',
      md.parse('ignored\n\n**12,400** this week — *+18%*\n\n2*3 bad NaN Infinity', {}),
      md,
    ),
  ).toEqual({ written: { value: 'ignored', label: '', hint: undefined, data: [12, 400, 2, 2, 2] } })
  expect(
    tokensToProps(
      'GraphKpi',
      md.parse('**12,400** this week — *+18%*\n2*3 bad NaN Infinity', {}),
      md,
    ),
  ).toEqual({ written: { value: '12,400', label: 'this week', hint: '+18%', data: [2, 2, 2] } })
})
it('Plot retains aligned list labels and list precedence', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'GraphPlot',
      md.parse('- Mon: 12,400ms\n- bad: no\n- 3\n- Tue: -4.5\n\n99', {}),
      md,
    ),
  ).toEqual({ written: { data: [12400, 3, -4.5], labels: ['Mon', '', 'Tue'] } })
})
it.each(['GraphPlot', 'GraphKpi'] as const)(
  '%s unsupported fences fall back explicitly',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
    expect(md.render(`<${name} title="T">\n\n\`\`\`txt\n12\n\`\`\`\n\n</${name}>`)).not.toContain(
      'v-bind=',
    )
    expect(warnings).toHaveLength(1)
  },
)
