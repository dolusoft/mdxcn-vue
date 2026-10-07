import MarkdownIt from 'markdown-it'
import { createMarkdownRenderer, disposeMdItInstance } from 'vitepress'
import { expect, it } from 'vitest'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { ComponentName, MarkdownWarning } from '../src'
import fixtures from '../../mdxcn-vue/test/fixtures/dated-calendar-examples.json'
it.each(fixtures.filter((c) => c.body))(
  '$name compiles independent upstream fixture',
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
          JSON.stringify(tokensToProps(c.name as ComponentName, md.parse(c.body, {}), md)),
        ),
      ).toEqual(c.model)
      expect(md.render(`<${c.name} year="2026" month="3">\n\n${c.body}\n\n</${c.name}>`)).toContain(
        'v-bind=',
      )
      expect(warnings).toEqual([])
    } finally {
      disposeMdItInstance()
    }
  },
)
it.each(['GraphActivity', 'GraphCalendar'] as const)('%s compiles empty input', (name) => {
  expect(tokensToProps(name, [], new MarkdownIt())).toEqual(
    name === 'GraphActivity' ? { days: [] } : { written: [] },
  )
})
it.each([
  ['GraphActivity', 'days'],
  ['GraphCalendar', 'written'],
] as const)('%s explicit %s falls back', (name, field) => {
  const warnings: MarkdownWarning[] = [],
    md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
  expect(md.render(`<${name} :${field}="null">\n\n- 12: note\n\n</${name}>`)).not.toContain(
    'v-bind=',
  )
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
it('calendar compiles marks and today props with independent inferred today', () => {
  const warnings: MarkdownWarning[] = [],
    md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
  const output = md.render(
    '<GraphCalendar year="2026" month="3" marks="12" today="4">\n\n- **18**: note\n\n</GraphCalendar>',
  )
  expect(output).toContain('v-bind=')
  expect(output).toContain('written')
  expect(warnings).toEqual([])
})
it.each(['GraphActivity', 'GraphCalendar'] as const)('%s unsupported fences fall back', (name) => {
  const warnings: MarkdownWarning[] = [],
    md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
  expect(md.render(`<${name}>\n\n\`\`\`txt\n1\n\`\`\`\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings).toHaveLength(1)
})
it('activity restores emphasis run markers and paragraph boundaries', () => {
  const md = new MarkdownIt(),
    body = '2026-03-07: 1*2 0*2 3\n\n2026-03-12: 4'
  expect(tokensToProps('GraphActivity', md.parse(body, {}), md)).toEqual({
    days: [
      { date: '2026-03-07', count: 1 },
      { date: '2026-03-08', count: 1 },
      { date: '2026-03-09', count: 0 },
      { date: '2026-03-10', count: 0 },
      { date: '2026-03-11', count: 3 },
      { date: '2026-03-12', count: 4 },
    ],
  })
})
it('calendar condenses softbreaks and drops newline between inline hosts', () => {
  const md = new MarkdownIt()
  expect(tokensToProps('GraphCalendar', md.parse('- **29**: leap  day\n  note', {}), md)).toEqual({
    written: [{ day: 29, accent: true, label: 'leap day note', today: true }],
  })
  expect(tokensToProps('GraphCalendar', md.parse('- **12**\n  *day*', {}), md)).toEqual({
    written: [{ day: 12, accent: true, label: undefined, today: true }],
  })
})
