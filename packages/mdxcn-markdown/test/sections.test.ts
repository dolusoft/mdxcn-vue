import MarkdownIt from 'markdown-it'
import { expect, it } from 'vitest'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { ComponentName, MarkdownWarning } from '../src'
import examples from '../../mdxcn-vue/test/fixtures/sections-examples.json'

it.each(examples)('$name $props.title compiles the independent upstream model', (c) => {
  const md = new MarkdownIt()
  const model = tokensToProps(c.name as ComponentName, md.parse(c.body, {}), md)
  expect(JSON.parse(JSON.stringify(model))).toEqual(
    c.name === 'Faq' ? { entries: c.entries } : { columns: c.columns },
  )
  const warnings: MarkdownWarning[] = []
  const compiler = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w) => warnings.push(w),
  })
  expect(compiler.render(c.source)).toContain('v-bind=')
  expect(warnings).toEqual([])
})
it.each(['Faq', 'GraphBoard'] as const)('%s discards preamble and keeps empty headings', (name) => {
  const md = new MarkdownIt()
  const result = tokensToProps(name, md.parse('ignored\n\n# Empty\n\n###### **Last**\n', {}), md)
  expect(result).toEqual(
    name === 'Faq'
      ? {
          entries: [
            { question: 'Empty', accent: false },
            { question: 'Last', accent: true },
          ],
        }
      : {
          columns: [
            { title: 'Empty', items: [] },
            { title: 'Last', items: [] },
          ],
        },
  )
  expect(tokensToProps(name, md.parse('just body', {}), md)).toEqual(
    name === 'Faq' ? { entries: [] } : { columns: [] },
  )
})
it('Faq preserves nested prose lists, blockquotes and ordered start', () => {
  const md = new MarkdownIt()
  const result = tokensToProps(
    'Faq',
    md.parse('### Q\n\n> **answer**\n\n3. item\n   - nested `code`', {}),
    md,
  )
  expect(result).toMatchObject({
    entries: [
      {
        question: 'Q',
        answer: [
          {
            tag: 'blockquote',
            children: [
              {
                tag: 'p',
                content: expect.arrayContaining([
                  { type: 'strong', children: [{ type: 'text', value: 'answer' }] },
                ]),
              },
            ],
          },
          {
            tag: 'ol',
            start: 3,
            children: [{ tag: 'li', children: [{ tag: 'inline' }, { tag: 'ul' }] }],
          },
        ],
      },
    ],
  })
})
it('GraphBoard follows direct list semantics and nested emphasis precedence', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps(
      'GraphBoard',
      md.parse('### A\n\n1. *label* — note\n   - **nested**\n\n### B\n\n| h |\n| --- |\n| |', {}),
      md,
    ),
  ).toEqual({
    columns: [
      { title: 'A', items: [{ label: 'label', state: 'now', note: 'note' }] },
      { title: 'B', items: [] },
    ],
  })
})
it.each(['Faq', 'GraphBoard'] as const)(
  '%s preserves explicit and dynamic runtime paths',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
      warn: (w: MarkdownWarning) => warnings.push(w),
    })
    for (const [attrs, body, reason] of [
      ['', '### {{ question }}\n\nbody', 'Dynamic Vue content'],
      [name === 'Faq' ? ':entries="[]"' : ':columns="[]"', '### A\n\n- x', 'Explicit data props'],
      ['', '### A\n\n<Custom />', 'Unsupported'],
    ]) {
      warnings.length = 0
      expect(md.render(`<${name} ${attrs}>\n\n${body}\n\n</${name}>`)).not.toContain('v-bind=')
      expect(warnings[0]?.reason).toContain(reason)
    }
  },
)
it('Faq falls back for fences and tables while retaining their runtime content', () => {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, {
    warn: (w: MarkdownWarning) => warnings.push(w),
  })
  for (const body of ['```js\nconst x = 1\n```', '| a |\n| --- |\n| |']) {
    warnings.length = 0
    const html = md.render(`<Faq>\n\n### Q\n\n${body}\n\n</Faq>`)
    expect(html).not.toContain('v-bind=')
    expect(html).toContain(body.startsWith('```') ? '<pre>' : '<table>')
    expect(warnings[0]?.reason).toContain('Unsupported FAQ block')
  }
})
it('GraphBoard separates the paragraphs of a loose item with a space', () => {
  const md = new MarkdownIt()
  expect(tokensToProps('GraphBoard', md.parse('### A\n\n- one\n\n  two\n', {}), md)).toEqual({
    columns: [{ title: 'A', items: [{ label: 'one two', state: 'done' }] }],
  })
})
