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
  it.each(['Terminal', 'Endpoint'])(
    'keeps fences inside an explicit %s reader and upgrades a following session',
    (name) => {
      const { md, warnings } = parser({ components: ['Terminal'] })
      const source = `<${name}>\n\n\`\`\`console\n$ inside\n\`\`\`\n\n</${name}>\n\n\`\`\`console\n$ outside\n\`\`\``
      const output = md.render(source)
      expect(output).toContain('<pre><code class="language-console">$ inside\n</code></pre>')
      expect(output.match(/<Terminal v-bind=/g)).toHaveLength(1)
      expect(props(output)).toEqual({ prompt: '$', text: '$ outside' })
      expect(warnings).toEqual([])
    },
  )
  it('does not treat a self-closing Terminal with a quoted > prompt as a fence owner', () => {
    const { md } = parser({ components: ['Terminal'] })
    expect(
      props(md.render('<Terminal prompt=">" text="one" />\n\n```console\n$ outside\n```')),
    ).toEqual({
      prompt: '$',
      text: '$ outside',
    })
  })
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
    const output = md.render('> **Rich**\n> — Ada & Bob, Book &lt;name&gt;')
    expect(output).toContain('<strong>Rich</strong>')
    expect(output).toContain('<cite>Ada &amp; Bob</cite>')
    expect(output).toContain('<footer>— <cite>Ada &amp; Bob</cite>, Book &lt;name&gt;</footer>')
  })
  it.each([
    { source: 'Book <name>', escaped: 'Book &lt;name&gt;', plain: 'Book' },
    {
      source: '<script>alert(1)</script>',
      escaped: '&lt;script&gt;alert(1)&lt;/script&gt;',
      plain: 'alert(1)',
    },
  ])(
    'handles raw attribution $source according to the HTML setting',
    ({ source, escaped, plain }) => {
      for (const html of [false, true]) {
        for (const registered of [false, true]) {
          const md = new MarkdownIt({ html }).use(withMdxcn, {
            components: registered ? ['Quote'] : [],
            warn: () => {},
          })
          const output = md.render(`> **Rich**\n> — Ada & Bob, ${source}`)
          expect(output).toContain('<strong>Rich</strong>')
          expect(output).not.toMatch(/<(?:name|script)\b/)
          if (registered) {
            expect(props(output)).toEqual({ by: 'Ada & Bob', source: html ? plain : source })
            expect(output).toContain(html ? plain : escaped)
          } else {
            expect(output).toContain(
              `<footer>— <cite>Ada &amp; Bob</cite>, ${html ? plain : escaped}</footer>`,
            )
          }
        }
      }
    },
  )
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
    expect(output).toContain('custom-block github-alert')
    expect(output).toContain('<strong>Body</strong>')
    expect(output).not.toContain('<aside')
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
    expect(output).toContain('custom-block github-alert')
    expect(warnings).toMatchObject([{ file: 'combined.md', line: 11, component: 'Callout' }])
  })
})

it('summarizes missing components once per parser across documents', () => {
  const { md, warnings } = parser()
  for (const path of ['first.md', 'second.md'])
    md.render('> [!NOTE]\n> Body\n\n> [!TIP]\n> More\n\n> Quote\n> — Ada', { path })
  expect(warnings.map((w) => w.component)).toEqual(['Callout', 'Quote'])
  expect(warnings.every((w) => w.file === 'first.md')).toBe(true)
  const otherSite = parser()
  otherSite.md.render('> [!NOTE]\n> Body')
  expect(otherSite.warnings.map((w) => w.component)).toEqual(['Callout'])
})

it.each([false, true])(
  'does not warn for consumed Endpoint fences with upgrades first=%s',
  (upgradesFirst) => {
    const warnings: MarkdownWarning[] = []
    const md = new MarkdownIt({ html: true })
    const options = { warn: (warning: MarkdownWarning) => warnings.push(warning) }
    if (upgradesFirst) md.use(withMdxcn, options).use(mdxcnMarkdown, options)
    else md.use(mdxcnMarkdown, options).use(withMdxcn, options)
    const output = md.render('<Endpoint>\n\nPOST /api\n\n```console\n$ run\n```\n\n</Endpoint>')
    expect(output).toContain('<Endpoint v-bind=')
    expect(warnings).toEqual([])
    md.render('```console\n$ run\n```')
    expect(warnings.map((w) => w.component)).toEqual(['Terminal'])
  },
)

describe('host fallback preservation and registration order', () => {
  beforeEach(() => disposeMdItInstance())
  it.each(['> [!NOTE]\n> **Body**', '> [!CAUTION]+ Read this\n> Body'])(
    'preserves the complete original VitePress output for %s',
    async (source) => {
      const baseline = await createMarkdownRenderer('.')
      const expected = await baseline.renderAsync(source)
      disposeMdItInstance()
      const warnings: MarkdownWarning[] = []
      const md = await createMarkdownRenderer('.', {
        config: (md) => {
          md.use(withMdxcn, { warn: (w: MarkdownWarning) => warnings.push(w) })
        },
      })
      expect(await md.renderAsync(source)).toBe(expected)
      expect(warnings.map((w) => w.component)).toEqual(['Callout'])
    },
  )
  it('upgrades a host alert only when Callout is registered', async () => {
    const md = await createMarkdownRenderer('.', {
      config: (md) => {
        md.use(withMdxcn, { components: ['Callout'] })
      },
    })
    const output = await md.renderAsync('> [!NOTE]\n> **Body**')
    expect(props(output)).toEqual({ type: 'note' })
    expect(output).toContain('<Callout ')
    expect(output).toContain('<strong>Body</strong>')
    expect(output).not.toContain('custom-block')
  })
  it.each([false, true])(
    'compiles host Endpoint before diagnostics with upgrades first=%s',
    async (upgradesFirst) => {
      const warnings: MarkdownWarning[] = []
      const options = { warn: (w: MarkdownWarning) => warnings.push(w) }
      const md = await createMarkdownRenderer('.', {
        config: (md) => {
          if (upgradesFirst) md.use(withMdxcn, options).use(mdxcnMarkdown, options)
          else md.use(mdxcnMarkdown, options).use(withMdxcn, options)
        },
      })
      const output = await md.renderAsync(
        '<Endpoint>\n\nPOST /api\n\n```console\n$ run\n```\n\n</Endpoint>',
      )
      expect(props(output)).toMatchObject({
        method: 'POST',
        path: '/api',
        blocks: [{ label: 'request', code: '$ run' }],
      })
      expect(warnings).toEqual([])
    },
  )
})
