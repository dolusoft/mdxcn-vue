import { beforeEach, describe, expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { createMarkdownRenderer, disposeMdItInstance } from 'vitepress'
import { withMdxcn, mdxcnMarkdown } from '../src'
import { tokensToProps } from '../src'
import type { MarkdownWarning, MdxcnOptions, UpgradeComponent } from '../src'
import fixtures from './fixtures/upgrades.json'

function parser(options: MdxcnOptions = {}) {
  const warnings: MarkdownWarning[] = []
  const md = new MarkdownIt({ html: true }).use(withMdxcn, {
    ...options,
    warn: (warning: MarkdownWarning) => warnings.push(warning),
  })
  return { md, warnings }
}
function props(output: string): object {
  const match = output.match(/v-bind="([^"]+)"/)!
  return JSON.parse(
    match[1]!
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&'),
  )
}
describe('independent upstream Markdown upgrade fixtures', () => {
  it('decodes nested entities exactly once with plain markdown-it', () => {
    const md = new MarkdownIt()
    expect(
      tokensToProps('GraphStack', md.parse('- A &amp;amp; &amp; B: 1 js', {}), md),
    ).toMatchObject({ rows: [{ label: 'A &amp; & B' }] })
  })
  it.each(fixtures)('$name falls back to complete native HTML with one warning', (fixture) => {
    const { md, warnings } = parser()
    expect(md.render(fixture.source, { path: 'fixtures/upgrades.md' })).toBe(fixture.native)
    expect(warnings).toEqual([
      {
        file: 'fixtures/upgrades.md',
        line: 1,
        component: fixture.component,
        reason: 'Component is not registered; using native HTML',
      },
    ])
  })
  it.each(fixtures)(
    '$name emits the registered component and independent expected props',
    (fixture) => {
      const { md, warnings } = parser({ components: [fixture.component as UpgradeComponent] })
      const output = md.render(fixture.source)
      expect(output).toContain(`<${fixture.component} `)
      expect(props(output)).toEqual(fixture.props)
      if ('body' in fixture) expect(output).toContain(fixture.body)
      expect(output).not.toMatch(/\[!|— Ada|-- Ada/)
      expect(warnings).toEqual([])
    },
  )
  it.each([
    ['info', 'note', 'info'],
    ['abstract', 'note', 'summary'],
    ['summary', 'note', 'summary'],
    ['question', 'note', 'question'],
    ['tip', 'tip', undefined],
    ['hint', 'tip', 'hint'],
    ['success', 'tip', 'success'],
    ['important', 'warning', 'important'],
    ['warning', 'warning', undefined],
    ['attention', 'warning', 'attention'],
    ['danger', 'danger', undefined],
    ['error', 'danger', 'error'],
    ['bug', 'danger', 'bug'],
    ['unknown', 'note', 'unknown'],
  ])('maps alert alias %s exactly as upstream', (kind, type, title) => {
    const { md } = parser({ components: ['Callout'] })
    expect(props(md.render(`> [!${kind}]\n> Body`))).toEqual({ type, ...(title ? { title } : {}) })
  })
  it.each(['console', 'shell-session', 'terminal'])(
    'defaults unprompted %s sessions to $',
    (language) => {
      const { md } = parser({ components: ['Terminal'] })
      expect(props(md.render(`\`\`\`${language}\noutput\n\`\`\``))).toEqual({
        prompt: '$',
        text: 'output',
      })
    },
  )
  it('selects the most frequent prompt and preserves code whitespace and entities', () => {
    const { md } = parser({ components: ['Terminal'] })
    expect(props(md.render('```console\n$ once\n❯ twice\n❯ again\n\n  &amp;\n\n```'))).toEqual({
      prompt: '❯',
      text: '$ once\n❯ twice\n❯ again\n\n  &amp;\n',
    })
  })
  it.each(['bash', 'sh', 'shell', 'fish', 'zsh'])(
    'keeps unprompted %s scripts and non-$ prompts as code',
    (language) => {
      const { md, warnings } = parser({ components: ['Terminal'] })
      for (const code of ['echo hello', '% run'])
        expect(md.render(`\`\`\`${language}\n${code}\n\`\`\``)).toContain('<pre><code')
      expect(warnings).toEqual([])
    },
  )
  it('leaves ordinary quotes, byline-only quotes and non-shell fences alone', () => {
    const { md, warnings } = parser()
    for (const source of ['> Ordinary quote', '> — Ada', '```js\n$ run\n```'])
      expect(md.render(source)).not.toContain('data-mdxcn')
    expect(warnings).toEqual([])
  })
  it('keeps a code-only quote body and reads a rich byline as plain attribution', () => {
    const { md, warnings } = parser({ components: ['Quote'] })
    const output = md.render('> ```text\n> body\n> ```\n>\n> — **Ada**, *Notes*')
    expect(output).toContain('<pre><code class="language-text">body\n</code></pre>')
    expect(props(output)).toEqual({ by: 'Ada', source: 'Notes' })
    expect(warnings).toEqual([])
  })
  it('escapes native attribution and component bindings while retaining rich quote bodies', () => {
    const { md } = parser()
    const output = md.render('> **Rich**\n> — Ada & Bob, Book <name>')
    expect(output).toContain('<strong>Rich</strong>')
    expect(output).toContain('<cite>Ada &amp; Bob</cite>')
    expect(output).not.toContain('<name>')
  })
  it('allows every feature to be disabled independently', () => {
    const { md, warnings } = parser({
      alerts: false,
      quotes: false,
      terminals: false,
      footnotes: false,
    })
    for (const fixture of fixtures) expect(md.render(fixture.source)).not.toContain('data-mdxcn')
    expect(warnings).toEqual([])
  })
  it('allows alerts and quotes to be toggled separately', () => {
    const { md } = parser({ alerts: false, components: ['Quote'] })
    expect(md.render('> Quote\n> — Ada')).toContain('<Quote ')
    expect(md.render('> [!NOTE]\n> Body')).toContain('[!NOTE]')
  })
})

describe('VitePress host integration', () => {
  // VitePress caches one renderer process-wide, regardless of later options.
  beforeEach(() => disposeMdItInstance())
  it('decodes nested host entities exactly once in compiled props', async () => {
    const md = await createMarkdownRenderer('.', {
      config: (md) => {
        md.use(mdxcnMarkdown)
      },
    })
    const output = await md.renderAsync(
      '<GraphStack>\n\n- A &amp;amp; &amp; B: 1 js\n\n</GraphStack>',
    )
    expect(props(output)).toMatchObject({ rows: [{ label: 'A &amp; & B' }] })
  })
  it('handles native alerts before the host rule and includes frontmatter warning lines', async () => {
    const warnings: MarkdownWarning[] = []
    const md = await createMarkdownRenderer('.', {
      config: (md) => {
        md.use(withMdxcn, { warn: (warning: MarkdownWarning) => warnings.push(warning) })
      },
    })
    const output = await md.renderAsync('---\ntitle: Test\n---\n\n> [!NOTE]\n> **Body**', {
      path: 'note.md',
    })
    expect(output).toContain('<aside data-mdxcn="Callout"')
    expect(output).toContain('<strong>Body</strong>')
    expect(output).not.toContain('custom-block')
    expect(warnings).toMatchObject([{ file: 'note.md', line: 5, component: 'Callout' }])
  })
  it.each([false, true])(
    'retains footnote anchors, backlinks and rich text with component=%s',
    async (registered) => {
      const warnings: MarkdownWarning[] = []
      const md = await createMarkdownRenderer('.', {
        config: (md) => {
          md.use(withMdxcn, {
            components: registered ? ['Footnotes'] : [],
            warn: (warning: MarkdownWarning) => warnings.push(warning),
          })
        },
      })
      const source = 'Read[^1] twice[^1].\n\n[^1]: **Note** with [link](/docs).'
      const output = await md.renderAsync(source, { path: 'footnotes.md' })
      expect(output).toContain('id="footnote1"')
      expect(output).toContain('id="footnote-ref1"')
      expect(output).toContain('id="footnote-ref1:1"')
      expect(output).toContain('href="#footnote-ref1"')
      expect(output).toContain('href="#footnote-ref1:1"')
      expect(output).toContain('<strong>Note</strong>')
      expect(output).toContain('href="/docs.html"')
      expect(output.includes('<Footnotes>')).toBe(registered)
      expect(warnings).toHaveLength(registered ? 0 : 1)
      if (!registered)
        expect(warnings[0]).toMatchObject({ file: 'footnotes.md', line: 3, component: 'Footnotes' })
    },
  )
  it('does not frame footnotes when disabled', async () => {
    const warnings: MarkdownWarning[] = []
    const md = await createMarkdownRenderer('.', {
      config: (md) => {
        md.use(withMdxcn, {
          footnotes: false,
          components: ['Footnotes'],
          warn: (warning: MarkdownWarning) => warnings.push(warning),
        })
      },
    })
    expect(await md.renderAsync('Text[^n]\n\n[^n]: Note')).not.toContain('<Footnotes>')
    expect(warnings).toEqual([])
  })
  it('composes with graph compilation and uses one source offset', async () => {
    const warnings: MarkdownWarning[] = []
    const md = await createMarkdownRenderer('.', {
      config: (md) => {
        md.use(mdxcnMarkdown, { warn: (warning: MarkdownWarning) => warnings.push(warning) })
        md.use(withMdxcn, { warn: (warning: MarkdownWarning) => warnings.push(warning) })
      },
    })
    const output = await md.renderAsync(
      '---\ntitle: Test\n---\n\n<GraphStack>\n\n- Web :tada:: 1 js\n\n</GraphStack>\n\n> [!TIP]\n> Body',
      { path: 'combined.md' },
    )
    expect(output).toContain('<GraphStack v-bind=')
    expect(output).toContain('🎉')
    expect(output).toContain('<aside data-mdxcn="Callout"')
    expect(warnings).toMatchObject([{ file: 'combined.md', line: 11, component: 'Callout' }])
  })
})
