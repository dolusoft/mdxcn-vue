import { expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { MarkdownWarning } from '../src'
import type { StateListItem } from 'mdxcn-vue/core'
import {
  ganttFromList,
  normalizeGantt,
  diffFromList,
  waterfallFromList,
  normalizeWaterfall,
} from 'mdxcn-vue/core'
const names = ['GraphGantt', 'GraphDiff', 'GraphWaterfall'] as const
const md = new MarkdownIt()
const rows = (name: (typeof names)[number], source: string) =>
  (tokensToProps(name, md.parse(source, {}), md) as { list: StateListItem[] }).list
it('compiles independent Gantt fractions and Waterfall numeric models', () => {
  expect(
    normalizeGantt(rows('GraphGantt', '- **build**: 0.2 0.75 0.55').map(ganttFromList)),
  ).toEqual([{ label: 'build', start: 0.2, end: 0.75, complete: 0.55, accent: true }])
  expect(
    normalizeWaterfall(
      rows('GraphWaterfall', '- cost: -1,234.5\n- Unicode: −2').map(waterfallFromList),
    ).map((s) => s.value),
  ).toEqual([-1234.5, 0])
})
it('compiles Diff direct strike rewrites and bold footer without losing prefixes', () => {
  expect(
    rows('GraphDiff', '- config: ~~old.js~~ new.ts\n- **now: +14**').flatMap(diffFromList),
  ).toEqual([
    { label: 'config: old.js', value: '', sign: 'remove' },
    { label: 'config: new.ts', value: '', sign: 'add' },
    { label: 'now', value: '14', sign: 'add', total: true },
  ])
})
it('uses only the first loose paragraph for Diff strike rewrites', () => {
  expect(
    rows('GraphDiff', '- config: ~~old~~ new\n\n  Ignored **note**.').flatMap(diffFromList),
  ).toEqual([
    { label: 'config: old', value: '', sign: 'remove' },
    { label: 'config: new', value: '', sign: 'add' },
  ])
})
it.each([
  ['GraphGantt', 'items'],
  ['GraphDiff', 'rows'],
  ['GraphDiff', 'footer'],
  ['GraphWaterfall', 'items'],
] as const)('keeps explicit %s %s in the runtime path', (name, field) => {
  const warnings: MarkdownWarning[] = []
  const parser = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  expect(
    parser.render('<' + name + ' :' + field + '="[]">\n\n- task: 1\n\n</' + name + '>'),
  ).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
it.each(names)('compiles ordered and multiline %s openings', (name) => {
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
  expect(md.render(`<${name}\n title="T">\n\n1. 2 docs\n\n</${name}>`)).toContain('v-bind=')
})
it.each(names)('keeps dynamic %s content on the runtime path', (name) => {
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
it.each(names)('preserves explicit %s data precedence', (name) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  expect(md.render(`<${name} :list="[]">\n\n- 2 docs\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
