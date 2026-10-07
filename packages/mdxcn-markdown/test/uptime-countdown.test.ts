import MarkdownIt from 'markdown-it'
import { expect, it } from 'vitest'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { ComponentName, MarkdownWarning } from '../src'
import fixtures from '../../mdxcn-vue/test/fixtures/uptime-countdown-examples.json'
it.each(fixtures.filter((c) => c.body))('$example compiles independent fixture', (c) => {
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
  expect(tokensToProps(c.name as ComponentName, md.parse(c.body, {}), md)).toEqual(c.model)
  expect(md.render(`<${c.name}>\n\n${c.body}\n\n</${c.name}>`)).toContain('v-bind=')
})
it.each(['GraphUptime', 'GraphCountdown'] as const)('%s supports empty content', (name) => {
  expect(tokensToProps(name, [], new MarkdownIt())).toEqual(
    name === 'GraphUptime' ? { days: [] } : { written: { label: '', rest: '' } },
  )
})
it.each([
  ['GraphUptime', 'days'],
  ['GraphCountdown', 'written'],
] as const)('%s explicit %s falls back', (name, field) => {
  const warnings: MarkdownWarning[] = [],
    md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (w: MarkdownWarning) => warnings.push(w),
    })
  expect(md.render(`<${name} :${field}="null">\n\ncontent\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
it.each(['GraphUptime', 'GraphCountdown'] as const)('%s fences fall back explicitly', (name) => {
  const warnings: MarkdownWarning[] = [],
    md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (w: MarkdownWarning) => warnings.push(w),
    })
  expect(md.render(`<${name}>\n\n\`\`\`text\ncontent\n\`\`\`\n\n</${name}>`)).not.toContain(
    'v-bind=',
  )
  expect(warnings).toHaveLength(1)
})
it('uptime restores emphasis markers and separates paragraphs', () => {
  const md = new MarkdownIt(),
    body = 'ok*2 down*2\n\nempty   degraded'
  expect(tokensToProps('GraphUptime', md.parse(body, {}), md)).toEqual({
    days: ['ok', 'ok', 'down', 'down', 'empty', 'degraded'],
  })
})
it('countdown condenses softbreaks and multiple spaces while retaining caption with target prop', () => {
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown),
    body = '2027-01-15 — until  launch\nwith **bold** text'
  expect(tokensToProps('GraphCountdown', md.parse(body, {}), md)).toEqual({
    written: { label: '2027-01-15', rest: 'until launch with bold text' },
  })
  expect(
    md.render(
      `<GraphCountdown to="2027-01-01" caption="override">\n\n${body}\n\n</GraphCountdown>`,
    ),
  ).toContain('v-bind=')
})
it.each([
  '### ok\n\ndown',
  '> ok\n>\n> down',
  '| a | b |\n| - | - |\n| ok | down |',
  '- ok\n- down',
])('uptime block boundaries do not glue status words (%#)', (body) => {
  const md = new MarkdownIt()
  expect(tokensToProps('GraphUptime', md.parse(body, {}), md)).toEqual({ days: ['ok', 'down'] })
})
it('countdown keeps the caption separator across paragraphs', () => {
  const md = new MarkdownIt()
  expect(tokensToProps('GraphCountdown', md.parse('2027-01-15\n\n— until launch', {}), md)).toEqual(
    { written: { label: '2027-01-15', rest: 'until launch' } },
  )
})
