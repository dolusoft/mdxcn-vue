import MarkdownIt from 'markdown-it'
import { createMarkdownRenderer, disposeMdItInstance } from 'vitepress'
import { expect, it } from 'vitest'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { ComponentName, MarkdownWarning } from '../src'
import fixtures from '../../mdxcn-vue/test/fixtures/nested-flow-examples.json'
it.each(fixtures)('$name $props.title compiles through VitePress without fallback', async (c) => {
  const warnings: MarkdownWarning[] = []
  const md = await createMarkdownRenderer('.', {
    config: (md) => {
      md.use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
    },
  })
  try {
    expect(
      JSON.parse(JSON.stringify(tokensToProps(c.name as ComponentName, md.parse(c.body, {}), md))),
    ).toEqual(c.model)
    expect(md.render(c.source)).toContain('v-bind=')
    expect(warnings).toEqual([])
  } finally {
    disposeMdItInstance()
  }
})
it('Check keeps real reference links on the runtime fallback path', () => {
  const md = new MarkdownIt()
  expect(() => tokensToProps('GraphCheck', md.parse('- [x] [reference]', {}), md)).toThrow(
    'Unresolved reference links',
  )
})
it('VitePress loose task checkbox stays inside its paragraph and is not a direct completion marker', async () => {
  const md = await createMarkdownRenderer('.')
  try {
    expect(tokensToProps('GraphCheck', md.parse('- [x] first\n\n  continuation', {}), md)).toEqual({
      items: [{ label: 'first continuation', done: false, note: undefined, items: undefined }],
    })
  } finally {
    disposeMdItInstance()
  }
})
it.each(fixtures)('$name $props.title matches the independent upstream model', (c) => {
  const md = new MarkdownIt()
  expect(
    JSON.parse(JSON.stringify(tokensToProps(c.name as ComponentName, md.parse(c.body, {}), md))),
  ).toEqual(c.model)
  const warnings: MarkdownWarning[] = []
  expect(
    new MarkdownIt({ html: true })
      .use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
      .render(c.source),
  ).toContain('v-bind=')
  expect(warnings).toEqual([])
})
it.each(['GraphTree', 'GraphCheck', 'GraphFlow'] as const)('%s compiles empty input', (name) => {
  const md = new MarkdownIt()
  expect(tokensToProps(name, [], md)).toEqual({
    [name === 'GraphTree' ? 'nodes' : name === 'GraphCheck' ? 'items' : 'rows']: [],
  })
})
it.each(['GraphTree', 'GraphCheck'] as const)(
  '%s keeps loose paragraphs separate at every depth',
  (name) => {
    const md = new MarkdownIt()
    const result = tokensToProps(
      name,
      md.parse('- first\n\n  second — note\n\n  1. child\n\n     continuation', {}),
      md,
    )
    expect(result).toMatchObject(
      name === 'GraphTree'
        ? {
            nodes: [
              { label: 'first second', meta: 'note', children: [{ label: 'child continuation' }] },
            ],
          }
        : {
            items: [
              { label: 'first second', note: 'note', items: [{ label: 'child continuation' }] },
            ],
          },
    )
  },
)
it.each(['GraphTree', 'GraphCheck', 'GraphFlow'] as const)(
  '%s explicit data preserves runtime precedence',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const field = name === 'GraphTree' ? 'nodes' : name === 'GraphCheck' ? 'items' : 'rows'
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
    expect(md.render(`<${name} title="T" :${field}="[]">\n\n- a → b\n\n</${name}>`)).not.toContain(
      'v-bind=',
    )
    expect(warnings[0]?.reason).toContain('Explicit data props')
  },
)
it('Flow prioritizes lists and preserves mixed inline nodes and arrow forms', () => {
  const md = new MarkdownIt()
  expect(
    tokensToProps('GraphFlow', md.parse('ignored\n\n1. A->**B**=>*C*—>D → E\n2. next', {}), md),
  ).toEqual({
    rows: [
      {
        nodes: [
          { label: 'A' },
          { label: 'B', tone: 'accent' },
          { label: 'C', tone: 'muted' },
          { label: 'D' },
          { label: 'E' },
        ],
      },
      { nodes: [{ label: 'next' }] },
    ],
  })
})
it.each(['GraphTree', 'GraphCheck', 'GraphFlow'] as const)(
  '%s unsupported fences use warning and runtime fallback',
  (name) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, { warn: (w) => warnings.push(w) })
    const source = `<${name} title="T">\n\n\`\`\`txt\nhello\n\`\`\`\n\n</${name}>`
    expect(md.render(source)).not.toContain('v-bind=')
    expect(warnings).toHaveLength(1)
  },
)
