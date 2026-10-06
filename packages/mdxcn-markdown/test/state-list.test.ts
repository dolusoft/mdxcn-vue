import { expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { MarkdownWarning } from '../src'
const decode = (html: string) =>
  JSON.parse(new MarkdownIt().utils.unescapeAll(html.match(/v-bind="([^"]*)"/)![1]!))
const text = (value: string) => ({ type: 'text', value })

it('compiles tight runbook items without hidden paragraph hosts', () => {
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
  expect(
    decode(
      md.render(
        '<Steps>\n\n1. Flip the flag — cache.v2 to off in the dashboard.\n2. **Watch p95** — Two minutes.\n\n</Steps>',
      ),
    ),
  ).toEqual({
    list: [
      {
        text: 'Flip the flag — cache.v2 to off in the dashboard.',
        paragraphs: [],
        strong: false,
        em: false,
      },
      { text: 'Watch p95 — Two minutes.', paragraphs: [], strong: true, em: false },
    ],
  })
})
it.each(['Steps', 'Changelog', 'Decision'] as const)(
  'requires a blank line before an ordered %s list',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (warning: MarkdownWarning) => warnings.push(warning),
    })
    expect(md.render(`<${name}>\n1. Source\n\n</${name}>`)).not.toContain('v-bind=')
    expect(warnings).toHaveLength(1)
    expect(warnings[0]?.reason).toContain('blank line')
  },
)
it('compiles loose install paragraphs with rich body content', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'Steps',
      md.parse(
        '1. **Register it**\n\n   Export from `mdx-components.tsx`.\n\n2. *Write*\n\n   Read [docs](/guide).',
        {},
      ),
      md,
    ),
  ).toEqual({
    list: [
      {
        text: 'Register itExport from mdx-components.tsx.',
        paragraphs: [
          [{ type: 'strong', children: [text('Register it')] }],
          [
            text('Export from '),
            { type: 'code', children: [text('mdx-components.tsx')] },
            text('.'),
          ],
        ],
        strong: true,
        em: false,
      },
      {
        text: 'WriteRead docs.',
        paragraphs: [
          [{ type: 'em', children: [text('Write')] }],
          [text('Read '), { type: 'link', href: '/guide', children: [text('docs')] }, text('.')],
        ],
        strong: false,
        em: true,
      },
    ],
  })
})
it('compiles changelog tokens with signals but preserves the upstream plain-text grammar', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'Changelog',
      md.parse('- added: **Callout**\n- fixed: Timeline connector on Safari', {}),
      md,
    ),
  ).toEqual({
    list: [
      { text: 'added: Callout', paragraphs: [], strong: true, em: false },
      { text: 'fixed: Timeline connector on Safari', paragraphs: [], strong: false, em: false },
    ],
  })
})
it('compiles database options and all non-list prose with rich code/link content', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'Decision',
      md.parse(
        'Before.\n\n- **Postgres** — boring, and we already run it\n- *Mongo* — no joins we trust\n- SQLite — fine until the second writer\n\nRevisit `2k`. [Docs](/guide).',
        {},
      ),
      md,
    ),
  ).toEqual({
    options: [
      { label: 'Postgres', reason: 'boring, and we already run it', state: 'chosen' },
      { label: 'Mongo', reason: 'no joins we trust', state: 'rejected' },
      { label: 'SQLite', reason: 'fine until the second writer', state: 'open' },
    ],
    after: [
      [text('Before.')],
      [
        text('Revisit '),
        { type: 'code', children: [text('2k')] },
        text('. '),
        { type: 'link', href: '/guide', children: [text('Docs')] },
        text('.'),
      ],
    ],
  })
})
it.each(['Steps', 'Changelog', 'Decision'] as const)(
  'keeps complex %s bodies on the runtime path with a positioned warning',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (warning: MarkdownWarning) => warnings.push(warning),
    })
    const html = md.render(`Intro.\n\n<${name}>\n\n- First\n  - **Nested**\n\n</${name}>`, {
      path: 'state-list.md',
    })
    expect(html).not.toContain('v-bind=')
    expect(html).toContain('<strong>Nested</strong>')
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatchObject({ component: name, file: 'state-list.md', line: 3 })
  },
)
it.each([
  ['Steps', 'list'],
  ['Changelog', 'list'],
  ['Decision', 'options'],
  ['Decision', 'after'],
] as const)('respects explicit %s %s precedence', (name, field) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (warning: MarkdownWarning) => warnings.push(warning),
  })
  const html = md.render(`<${name} :${field}="[]">\n\n- Source\n\nAfter.\n\n</${name}>`)
  expect(html).not.toContain('v-bind=')
  expect(html).toContain('After.')
  expect(warnings).toHaveLength(1)
})
it.each(['Steps', 'Changelog', 'Decision'] as const)(
  'falls back for %s item tags without discarding content',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (warning: MarkdownWarning) => warnings.push(warning),
    })
    expect(md.render(`<${name}>\n\n<Step title="Install">Rich</Step>\n\n</${name}>`)).toContain(
      'Rich',
    )
    expect(warnings).toHaveLength(1)
  },
)
it('uses strong over emphasis anywhere in an option including its reason', () => {
  const md = new MarkdownIt()
  expect(tokensToProps('Decision', md.parse('- *A* — **Reason**', {}), md)).toEqual({
    options: [{ label: 'A', reason: 'Reason', state: 'chosen' }],
    after: [],
  })
})
it('supports multiple ordered and unordered lists but does not consume surrounding Steps prose', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps('Steps', md.parse('Ignored.\n\n- A\n\n1. B\n\nIgnored too.', {}), md),
  ).toEqual({
    list: [
      { text: 'A', paragraphs: [], strong: false, em: false },
      { text: 'B', paragraphs: [], strong: false, em: false },
    ],
  })
})
