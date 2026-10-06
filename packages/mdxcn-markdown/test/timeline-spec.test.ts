import { expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { MarkdownWarning } from '../src'
const text = (value: string) => ({ type: 'text', value })
const decode = (html: string) =>
  JSON.parse(new MarkdownIt().utils.unescapeAll(html.match(/v-bind="([^"]*)"/)![1]!))
it('compiles timeline head/body with body-only signals separated and times intact', () => {
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
  expect(
    decode(
      md.render(
        '<GraphTimeline title="NIGHT">\n\n- 14:02: p95 crossed — inline\n\n  **Body note**\n\n- *14:40: write*\n\n</GraphTimeline>',
      ),
    ),
  ).toEqual({
    list: [
      {
        text: '14:02: p95 crossed — inlineBody note',
        paragraphs: [
          [text('14:02: p95 crossed — inline')],
          [{ type: 'strong', children: [text('Body note')] }],
        ],
        head: [text('14:02: p95 crossed — inline')],
        body: [[{ type: 'strong', children: [text('Body note')] }]],
        strong: false,
        em: false,
      },
      {
        text: '14:40: write',
        paragraphs: [[{ type: 'em', children: [text('14:40: write')] }]],
        head: [{ type: 'em', children: [text('14:40: write')] }],
        body: [],
        strong: false,
        em: true,
      },
    ],
  })
})
it('compiles spec inline code and body paragraphs into independent rich input', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps('GraphSpec', md.parse('- Path: `registry/default`\n\n  Edit **there**.', {}), md),
  ).toEqual({
    list: [
      {
        text: 'Path: registry/defaultEdit there.',
        paragraphs: [
          [text('Path: '), { type: 'code', children: [text('registry/default')] }],
          [text('Edit '), { type: 'strong', children: [text('there')] }, text('.')],
        ],
        head: [text('Path: '), { type: 'code', children: [text('registry/default')] }],
        body: [[text('Edit '), { type: 'strong', children: [text('there')] }, text('.')]],
        strong: false,
        em: false,
      },
    ],
  })
})
it.each(['GraphTimeline', 'GraphSpec'] as const)(
  'compiles ordered and multiline %s openings',
  (name) => {
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown)
    expect(
      md.render(`<${name}\n title="T"\n>\n\n1. a: first\n2. **b: second**\n\n</${name}>`),
    ).toContain('v-bind=')
  },
)
it.each(['GraphTimeline', 'GraphSpec'] as const)(
  'rejects missing blank line before %s list',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (w: MarkdownWarning) => warnings.push(w),
    })
    expect(md.render(`<${name}>\n1. a: first\n\n</${name}>`)).not.toContain('v-bind=')
    expect(warnings[0]?.reason).toContain('blank line')
  },
)
it.each([
  ['GraphTimeline', 'events'],
  ['GraphTimeline', 'list'],
  ['GraphSpec', 'rows'],
  ['GraphSpec', 'list'],
] as const)('preserves explicit %s %s field precedence', (name, field) => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  expect(md.render(`<${name} :${field}="[]">\n\n- a: first\n\n</${name}>`)).not.toContain('v-bind=')
  expect(warnings[0]?.reason).toContain('Explicit data props')
})
it.each(['GraphTimeline', 'GraphSpec'] as const)(
  'keeps nested %s lists on a positioned runtime fallback',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (w: MarkdownWarning) => warnings.push(w),
    })
    expect(
      md.render(`Intro.\n\n<${name}>\n\n- a: head\n  - nested\n\n</${name}>`, {
        filePath: 'fixture.md',
      }),
    ).not.toContain('v-bind=')
    expect(warnings[0]).toMatchObject({ component: name, line: 3, file: 'fixture.md' })
    expect(warnings[0]?.reason).toContain('Nested list')
  },
)
it.each(['GraphTimeline', 'GraphSpec'] as const)(
  'keeps dynamic %s content on runtime path',
  (name) => {
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: () => {} })
    expect(md.render(`<${name}>\n\n- a: {{value}}\n\n</${name}>`)).not.toContain('v-bind=')
  },
)
it('retains external link renderer attributes in spec heads', () => {
  const md = new MarkdownIt()
  md.renderer.rules.link_open = (tokens, index) => {
    tokens[index]!.attrSet('target', '_blank')
    tokens[index]!.attrSet('rel', 'noreferrer')
    return ''
  }
  const props = tokensToProps(
    'GraphSpec',
    md.parse('- Needs: [motion](https://motion.dev)', {}),
    md,
    {},
    { renderLinks: true },
  )
  expect(props).toMatchObject({
    list: [
      {
        head: [
          text('Needs: '),
          {
            type: 'link',
            href: 'https://motion.dev',
            target: '_blank',
            rel: 'noreferrer',
            children: [text('motion')],
          },
        ],
      },
    ],
  })
})
