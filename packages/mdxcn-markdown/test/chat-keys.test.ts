import { expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { MarkdownWarning } from '../src'
const text = (value: string) => ({ type: 'text', value })
const decode = (html: string) =>
  JSON.parse(new MarkdownIt().utils.unescapeAll(html.match(/v-bind="([^"]*)"/)![1]!))

it('compiles session rich heads without speaker loss or hidden paragraphs', () => {
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
  expect(
    decode(
      md.render(
        '<Chat title="SESSION">\n\n- you: which graph?\n- agent: *reads source*\n\n</Chat>',
      ),
    ),
  ).toEqual({
    list: [
      { head: [text('you: which graph?')], body: [] },
      { head: [text('agent: '), { type: 'em', children: [text('reads source')] }], body: [] },
    ],
  })
})
it('compiles loose support turns with inline code and separate body paragraphs', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'Chat',
      md.parse('- priya: help\n\n- jon: Do you swap `li`?\n\n  Wrap in `withMdxcn`.\n', {}),
      md,
    ),
  ).toEqual({
    list: [
      { head: [text('priya: help')], body: [] },
      {
        head: [text('jon: Do you swap '), { type: 'code', children: [text('li')] }, text('?')],
        body: [[text('Wrap in '), { type: 'code', children: [text('withMdxcn')] }, text('.')]],
      },
    ],
  })
})
it('compiles shortcut descriptions, bold emphasis anywhere and modifier text', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'Keys',
      md.parse(
        '- **⌘K: search the docs**\n- Ctrl+Shift+P: command palette\n- g then d: go to docs\n- Esc: **close**',
        {},
      ),
      md,
    ),
  ).toEqual({
    bindings: [
      { keys: '⌘K', action: 'search the docs', accent: true },
      { keys: 'Ctrl+Shift+P', action: 'command palette', accent: false },
      { keys: 'g then d', action: 'go to docs', accent: false },
      { keys: 'Esc', action: 'close', accent: true },
    ],
  })
})
it.each(['Chat', 'Keys'] as const)('compiles ordered %s lists', (name) => {
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
  expect(md.render(`<${name}>\n\n1. a: first\n2. b: second\n\n</${name}>`)).toContain('v-bind=')
})
it.each(['Chat', 'Keys'] as const)('requires blank lines before ordered %s lists', (name) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  expect(md.render(`<${name}>\n1. a: first\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('blank line')
})
it.each([
  ['Chat', ':turns="[]"', '- a: fallback'],
  ['Chat', ':list="[]"', '- a: fallback'],
  ['Keys', ':bindings="[]"', '- K: fallback'],
] as const)('keeps explicit %s %s on runtime path', (name, attrs, body) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  expect(md.render(`<${name} ${attrs}>\n\n${body}\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
it.each(['Chat', 'Keys'] as const)(
  'preserves complex %s host bodies via positioned fallback',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (w: MarkdownWarning) => warnings.push(w),
    })
    expect(
      md.render(`\n<${name}>\n\n- a: head\n  - nested\n\n</${name}>`, { filePath: 'fixture.md' }),
    ).not.toContain('v-bind=')
    expect(warnings[0]).toMatchObject({ component: name, line: 2 })
    expect(warnings[0]?.reason).toContain('Nested list')
  },
)
it('retains Chat host link attributes and soft line breaks', () => {
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
  const props = decode(md.render('<Chat>\n\n- a: [docs](/guide "Guide")\n  now\n\n</Chat>'))
  expect(props.list[0].head).toEqual([
    text('a: '),
    { type: 'link', href: '/guide', title: 'Guide', children: [text('docs')] },
    text('\n'),
    text('now'),
  ])
})
it.each(['Chat', 'Keys'] as const)('compiles empty %s lists without inventing rows', (name) => {
  const md = new MarkdownIt()
  expect(tokensToProps(name, [], md)).toEqual(name === 'Chat' ? { list: [] } : { bindings: [] })
})
