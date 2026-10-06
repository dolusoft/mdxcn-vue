import { expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { MarkdownWarning } from '../src'
import type { StateListItem } from 'mdxcn-vue/core'
import {
  statFromList,
  slopeFromList,
  bulletFromList,
  normalizeSlope,
  normalizeBullet,
} from 'mdxcn-vue/core'
const names = ['GraphStat', 'GraphSlope', 'GraphBullet'] as const
it('compiles stat hints and accent, slope arrows and bullet scale into independent models', () => {
  const md = new MarkdownIt()
  const rows = (name: (typeof names)[number], source: string) =>
    (tokensToProps(name, md.parse(source, {}), md) as { list: StateListItem[] }).list
  expect(
    rows('GraphStat', '- **142ms read — −18ms**\n- 410ms write — +22ms').map(statFromList),
  ).toEqual([
    { value: '142ms', label: 'read', hint: '−18ms', accent: true },
    { value: '410ms', label: 'write', hint: '+22ms', accent: false },
  ])
  expect(
    normalizeSlope(rows('GraphSlope', '- read: 1,200 -> -2.5\n- missing').map(slopeFromList)),
  ).toEqual([
    { label: 'read', from: 1200, to: -2.5 },
    { label: 'missing', from: 0, to: 0 },
  ])
  expect(
    normalizeBullet(
      rows('GraphBullet', '- CPU: 72 / 80 of 100\n- Zero: 0 / 0').map(bulletFromList),
    ),
  ).toEqual([
    { label: 'CPU', value: 72, target: 80, max: 100, display: undefined },
    { label: 'Zero', value: 0, target: 0, max: undefined, display: undefined },
  ])
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
  expect(md.render(`<${name} :items="[]">\n\n- 2 docs\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
it('includes stat bold signals from body paragraphs', () => {
  const md = new MarkdownIt()
  const props = tokensToProps('GraphStat', md.parse('- 142ms read\n\n  **Note**', {}), md) as {
    list: StateListItem[]
  }
  expect(props.list.map(statFromList)).toEqual([
    { value: '142ms', label: 'readNote', hint: undefined, accent: true },
  ])
})
