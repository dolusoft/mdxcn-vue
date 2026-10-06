import { expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { MarkdownWarning } from '../src'
import { scoreFromList, numericFromList } from 'mdxcn-vue/core'
const names = ['GraphScore', 'GraphRank', 'GraphFunnel'] as const
it('compiles independent score and numeric token models', () => {
  const md = new MarkdownIt()
  const score = tokensToProps('GraphScore', md.parse('- **Docs: 2.5/5**', {}), md) as {
    list: Parameters<typeof scoreFromList>[0][]
  }
  expect(score.list.map(scoreFromList)).toEqual([
    { label: 'Docs', value: 2.5, max: 5, accent: true },
  ])
  const rank = tokensToProps('GraphRank', md.parse('- 12,400 docs\n- 82% plot', {}), md) as {
    list: Parameters<typeof numericFromList>[0][]
  }
  expect(rank.list.map(numericFromList)).toEqual([
    { label: 'docs', value: 12400, display: '12,400' },
    { label: 'plot', value: 82, display: '82%' },
  ])
})
it.each(names)('compiles ordered and multiline %s openings', (name) => {
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
  expect(md.render(`<${name}\n title="T">\n\n1. 2 docs\n2. 3 ship\n\n</${name}>`)).toContain(
    'v-bind=',
  )
})
it.each(names)('keeps dynamic %s content in runtime path', (name) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  expect(md.render(`<${name}>\n\n- {{ value }} docs\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toBe('Dynamic Vue content')
})
it.each(names)('requires blank lines before %s ordered lists', (name) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  expect(md.render(`<${name}>\n1. 2 docs\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('blank line')
})
it.each([
  ['GraphScore', 'items'],
  ['GraphRank', 'items'],
  ['GraphFunnel', 'steps'],
] as const)('preserves explicit %s %s precedence', (name, field) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  expect(md.render(`<${name} :${field}="[]">\n\n- 2 docs\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('Explicit data props')
})

it('includes score bold signals from body paragraphs as upstream does', () => {
  const md = new MarkdownIt()
  const props = tokensToProps('GraphScore', md.parse('- Docs: 2.5/5\n\n  **Note**', {}), md) as {
    list: Parameters<typeof scoreFromList>[0][]
  }
  expect(props.list.map(scoreFromList)).toEqual([
    { label: 'Docs', value: 2.5, max: 5, accent: true },
  ])
})
