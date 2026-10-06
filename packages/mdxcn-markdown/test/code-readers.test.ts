import { describe, expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { createMarkdownRenderer, disposeMdItInstance } from 'vitepress'
import { mdxcnMarkdown, tokensToProps, withMdxcn } from '../src'
import type { MarkdownWarning } from '../src'

const retry =
  '```python\ndef fetch(url, times=3):  # (1)\n    return get(url)\n```\n\n1. Three **tries**.\n2. Read [docs](/guide).'
const environment =
  '```bash\n# Postgres connection string. Required.\nDATABASE_URL=postgres://localhost:5432/app\n\nANALYTICS_ID=\n```'
const decode = (output: string) => {
  const value = output.match(/v-bind="([^"]*)"/)![1]!
  return JSON.parse(new MarkdownIt().utils.unescapeAll(value))
}
describe('independent code-reader models', () => {
  it('compiles Annotate language, raw code and rich notes independently', () => {
    const md = new MarkdownIt()
    expect(tokensToProps('Annotate', md.parse(retry, {}), md)).toEqual({
      title: 'python',
      code: 'def fetch(url, times=3):  # (1)\n    return get(url)\n',
      notes: [
        [
          { type: 'text', value: 'Three ' },
          { type: 'strong', children: [{ type: 'text', value: 'tries' }] },
          { type: 'text', value: '.' },
        ],
        [
          { type: 'text', value: 'Read ' },
          { type: 'link', href: '/guide', children: [{ type: 'text', value: 'docs' }] },
          { type: 'text', value: '.' },
        ],
      ],
    })
  })
  it('compiles the first Env fence, comments and empty defaults', () => {
    const md = new MarkdownIt()
    expect(tokensToProps('Env', md.parse(environment, {}), md)).toEqual({
      vars: [
        {
          name: 'DATABASE_URL',
          value: 'postgres://localhost:5432/app',
          note: 'Postgres connection string.',
          required: true,
        },
        { name: 'ANALYTICS_ID', value: '', note: undefined, required: false },
      ],
    })
  })
  it('gives an empty Env fence precedence over nonempty lists', () => {
    const md = new MarkdownIt()
    expect(tokensToProps('Env', md.parse('```bash\n```\n\n- A: yes', {}), md)).toEqual({ vars: [] })
  })
  it('reads lists with normalized inline text and nested bold signals', () => {
    const md = new MarkdownIt()
    expect(
      tokensToProps(
        'Env',
        md.parse(
          '- **QUEUE_URL**: redis://localhost:6379 — jobs and retries\n- CONCURRENCY: 4 — per process\n- LOG_LEVEL: info',
          {},
        ),
        md,
      ),
    ).toEqual({
      vars: [
        {
          name: 'QUEUE_URL',
          value: 'redis://localhost:6379',
          note: 'jobs and retries',
          required: true,
        },
        { name: 'CONCURRENCY', value: '4', note: 'per process', required: false },
        { name: 'LOG_LEVEL', value: 'info', note: undefined, required: false },
      ],
    })
  })
  it('reads raw Env text and defaults empty Annotate inputs', () => {
    const md = new MarkdownIt()
    expect(tokensToProps('Env', md.parse('A=one\nB=two', {}), md)).toEqual({
      vars: [
        { name: 'A', value: 'one', note: undefined, required: false },
        { name: 'B', value: 'two', note: undefined, required: false },
      ],
    })
    expect(tokensToProps('Annotate', [], md)).toEqual({ title: 'code', code: '', notes: [] })
  })
})
describe('compiler, fallback and upgrade integration', () => {
  it('does not diagnose a Terminal for runtime reader fences when Terminal is unregistered', () => {
    const warnings: MarkdownWarning[] = []
    const options = { warn: (warning: MarkdownWarning) => warnings.push(warning) }
    const md = new MarkdownIt({ html: true }).use(mdxcnMarkdown, options).use(withMdxcn, options)
    md.render('<Env :vars="vars">\n\n```console\nA=one\n```\n\n</Env>')
    expect(warnings.map((warning) => warning.component)).toEqual(['Env'])
  })
  it.each([false, true])(
    'compiles both readers with upgrades first=%s and protects console fences',
    (first) => {
      const warnings: MarkdownWarning[] = []
      const md = new MarkdownIt({ html: true })
      const options = { warn: (warning: MarkdownWarning) => warnings.push(warning) }
      const upgrades = { ...options, components: ['Terminal'] as const }
      if (first) md.use(withMdxcn, upgrades).use(mdxcnMarkdown, options)
      else md.use(mdxcnMarkdown, options).use(withMdxcn, upgrades)
      const output = md.render(
        '<Annotate>\n\n```console\n$ code // (1)\n```\n\n1. Note\n\n</Annotate>\n\n<Env>\n\n```console\nA=one\n```\n\n</Env>\n\n```console\n$ outside\n```',
      )
      expect(output).toContain('<Annotate v-bind=')
      expect(output).toContain('<Env v-bind=')
      expect(output.match(/<Terminal v-bind=/g)).toHaveLength(1)
      expect(warnings).toEqual([])
    },
  )
  it.each([
    ['Annotate', ' :code="code"', retry],
    ['Annotate', ' :notes="notes"', retry],
    ['Env', ' :vars="vars"', environment],
    ['Annotate', '', '```js\nx\n```\n\n1. First\n\n   Second paragraph'],
    ['Annotate', '', '```js\nx\n```\n\n1. First\n   - nested'],
    ['Env', '', '- A: yes\n  - **nested**'],
  ])('preserves runtime resolution for %s %s', (name, attrs, body) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true })
      .use(mdxcnMarkdown, { warn: (warning: MarkdownWarning) => warnings.push(warning) })
      .use(withMdxcn, { components: ['Terminal'] })
    const output = md.render(`Intro\n\n<${name}${attrs}>\n\n${body}\n\n</${name}>`, {
      path: 'reader.md',
    })
    expect(output).toContain(`<${name}${attrs}>`)
    expect(output).not.toContain(`<${name} v-bind=`)
    expect(warnings).toMatchObject([{ component: name, file: 'reader.md', line: 3 }])
  })
  it('uses real host link rendering and preserves c++ source language', async () => {
    disposeMdItInstance()
    const md = await createMarkdownRenderer('.', {
      config: (md) => {
        md.use(mdxcnMarkdown, { renderLinks: true })
      },
    })
    const output = await md.renderAsync(
      '<Annotate>\n\n```c++{1}\nint a; // (1)\n```\n\n1. Read [table](/components/graph-table).\n\n</Annotate>',
    )
    expect(decode(output)).toMatchObject({
      title: 'c++',
      notes: [
        [
          { type: 'text', value: 'Read ' },
          { type: 'link', href: '/components/graph-table.html' },
          { type: 'text', value: '.' },
        ],
      ],
    })
    disposeMdItInstance()
  })
})
