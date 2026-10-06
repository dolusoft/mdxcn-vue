import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import { mdxcnMarkdown, tokensToProps } from '../src'
import type { MarkdownWarning } from '../src'

let md: MarkdownIt
const warnings: MarkdownWarning[] = []
beforeAll(async () => {
  // Reuse the installed VitePress parser, including its Vue component rules.
  md = await createMarkdownRenderer('.', {
    config: (md) => {
      md.use(mdxcnMarkdown, { warn: (warning: MarkdownWarning) => warnings.push(warning) })
    },
  })
})
const raw = (source: string): Token[] => {
  const tokens: Token[] = []
  md.block.parse(source, md, {}, tokens)
  return tokens
}
const compile = (source: string) => {
  warnings.length = 0
  return md.parse(source, { path: 'fixtures/example.md' })
}
const text = (value: string) => ({ type: 'text', value })

describe('raw tokens to independent expected models', () => {
  it('normalizes table whitespace across rich inline boundaries', () => {
    expect(
      tokensToProps('GraphTable', raw('| Name |\n| --- |\n| A   *B  C*   D |\n'), md),
    ).toMatchObject({
      rows: [
        [
          [
            { type: 'text', value: 'A ' },
            { type: 'em', children: [{ type: 'text', value: 'B C' }] },
            { type: 'text', value: ' D' },
          ],
        ],
      ],
    })
  })
  it.each(['js{1,3}', 'ts:line-numbers', 'cpp{1}', 'c++'])(
    'reads the fence language from %s',
    (info) => {
      expect(tokensToProps('Endpoint', raw(`\`\`\`${info}\nvalue\n\`\`\`\n`), md)).toMatchObject({
        blocks: [{ label: info.match(/^[^\s:{[]+/)?.[0], code: 'value' }],
      })
    },
  )
  it('keeps rich stack labels and parses comma-separated numeric segments', () => {
    expect(
      tokensToProps(
        'GraphStack',
        raw('- **Docs** *web* `app` [link](/docs): 48 js, 22 css, 30 images\n'),
        md,
      ),
    ).toEqual({
      rows: [
        {
          label: 'Docs web app link',
          labelContent: [
            { type: 'strong', children: [text('Docs')] },
            text(' '),
            { type: 'em', children: [text('web')] },
            text(' '),
            { type: 'code', children: [text('app')] },
            text(' '),
            { type: 'link', href: '/docs', children: [text('link')] },
          ],
          segments: [
            { label: 'js', value: 48 },
            { label: 'css', value: 22 },
            { label: 'images', value: 30 },
          ],
        },
      ],
    })
  })
  it('keeps rich table cells, alignment, and a bold final footer', () => {
    const source =
      '| Name | Count |\n| --- | ---: |\n| *Web* | `2` |\n| [Docs](/docs) | 3 |\n| **Sum** | 5 |\n'
    expect(tokensToProps('GraphTable', raw(source), md)).toEqual({
      headers: ['Name', 'Count'],
      align: ['left', 'right'],
      rows: [
        [[{ type: 'em', children: [text('Web')] }], [{ type: 'code', children: [text('2')] }]],
        [[{ type: 'link', href: '/docs', children: [text('Docs')] }], '3'],
      ],
      footer: [[{ type: 'strong', children: [text('Sum')] }], '5'],
    })
  })
  it('does not infer a footer from the sole body row and ignores center alignment', () => {
    expect(
      tokensToProps('GraphTable', raw('| A | B |\n| :---: | --- |\n| **Total** | 2 |\n'), md),
    ).toEqual({
      headers: ['A', 'B'],
      rows: [[[{ type: 'strong', children: [text('Total')] }], '2']],
    })
  })
  it('produces route, prose, required parameters and raw fences without highlight wrappers', () => {
    const source =
      'post /api/test\n\nSee **docs** and [link](/docs).\n\n| Param | Type | Description |\n| --- | --- | --- |\n| **id** | string | Use `slug` |\n| empty | | |\n\n```bash\n  curl /api/test\n```\n\n```json\n  { "ok": true }\n\n```\n'
    expect(tokensToProps('Endpoint', raw(source), md)).toEqual({
      method: 'POST',
      path: '/api/test',
      about: [
        [
          text('See '),
          { type: 'strong', children: [text('docs')] },
          text(' and '),
          { type: 'link', href: '/docs', children: [text('link')] },
          text('.'),
        ],
      ],
      params: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: [text('Use '), { type: 'code', children: [text('slug')] }],
        },
        { name: 'empty', type: undefined, required: false, description: undefined },
      ],
      blocks: [
        { label: 'request', code: '  curl /api/test' },
        { label: 'json', code: '  { "ok": true }\n' },
      ],
    })
  })
  it('keeps Endpoint defaults and does not infer a parameter footer', () => {
    expect(
      tokensToProps(
        'Endpoint',
        raw('| P | T | D |\n| --- | --- | --- |\n| **Total** | number | value |\n'),
        md,
      ),
    ).toEqual({
      method: 'GET',
      path: '/',
      about: [],
      blocks: [],
      params: [{ name: 'Total', type: 'number', required: true, description: [text('value')] }],
    })
  })
})
describe('component block plugin', () => {
  it.each([
    ['<GraphStack>\n\n- web: 1 js', 'Closing component tag'],
    ['<GraphStack>same line\n</GraphStack>', 'separate lines'],
    ['<GraphStack>\n- web: 1 js\n</GraphStack>', 'blank line'],
    ['<GraphStack v-if="true">\n- web: 1 js\n</GraphStack>', 'blank line'],
  ])('warns once with a source position for malformed input %s', (source, reason) => {
    const tokens = compile(`Intro\n\n${source}`)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatchObject({
      file: 'fixtures/example.md',
      line: 3,
      component: 'GraphStack',
    })
    expect(warnings[0]?.reason).toContain(reason)
    expect(md.renderer.render(tokens, md.options, {})).not.toContain('v-bind="{&quot;rows')
  })
  it.each([
    [':tada:', '🎉'],
    ['&amp;', '&'],
    ['&nbsp;', ' '],
  ])('uses host inline processing for %s', (input, output) => {
    const tokens = compile(`<GraphStack>\n\n- Web ${input} app: 1 js\n\n</GraphStack>`)
    expect(warnings).toEqual([])
    expect(tokens[0]?.content).toContain(
      `Web ${output === '&' ? '&amp;' : output === ' ' ? '' : output}${output === ' ' ? '' : ' '}app`,
    )
  })
  it('reports source lines including frontmatter and does not leak offsets to later files', () => {
    compile('---\ntitle: Test\n---\n\n<GraphStack>\n\n- {{ value }}\n\n</GraphStack>')
    expect(warnings[0]?.line).toBe(5)
    compile('<GraphStack>\n\n- {{ value }}\n\n</GraphStack>')
    expect(warnings[0]?.line).toBe(1)
  })
  it('supports multiline presentation attributes including greater-than signs in quotes', () => {
    const tokens = compile(
      '<GraphStack\n title="A > B"\n :ticks="3">\n\n- web: 2 js, 1 css\n\n</GraphStack>',
    )
    expect(warnings).toEqual([])
    expect(tokens).toHaveLength(1)
    expect(tokens[0]?.content).toContain('v-bind=')
    expect(tokens[0]?.content).toContain('title="A > B"')
  })
  it('applies host link URL, title and external attributes when requested', () => {
    const tokens = raw('- [Docs](https://example.com "Guide"): 1 js\n')
    expect(tokensToProps('GraphStack', tokens, md, {}, { renderLinks: true })).toMatchObject({
      rows: [
        {
          labelContent: [
            {
              type: 'link',
              href: 'https://example.com',
              title: 'Guide',
              target: '_blank',
              rel: 'noreferrer',
              children: [text('Docs')],
            },
          ],
        },
      ],
    })
  })
  it('resolves later-defined reference links before compiling props', () => {
    const tokens = compile(
      '<GraphStack title="X">\n\n- [Docs][guide]: 1 js\n\n</GraphStack>\n\n[guide]: /docs\n',
    )
    expect(warnings).toEqual([])
    const output = md.renderer.render(tokens, md.options, {})
    expect(output).toContain('&quot;href&quot;:&quot;/docs')
  })
  it('emits serializable props and removes the source slot before anchors', () => {
    const tokens = compile('<GraphStack title="BUNDLE">\n\n- web: 2 js, 1 css\n\n</GraphStack>\n')
    expect(warnings).toEqual([])
    expect(tokens).toHaveLength(1)
    expect(tokens[0]?.map).toEqual([0, 5])
    expect(tokens[0]?.content).toBe(
      '<GraphStack v-bind="{&quot;rows&quot;:[{&quot;label&quot;:&quot;web&quot;,&quot;segments&quot;:[{&quot;label&quot;:&quot;js&quot;,&quot;value&quot;:2},{&quot;label&quot;:&quot;css&quot;,&quot;value&quot;:1}]}]}" title="BUNDLE" />\n',
    )
  })
  it('escapes attribute quotes, entities, HTML and Vue-like code without data loss', () => {
    const tokens = compile('<Endpoint>\n\n```text\n"<&\' >"\n```\n\n</Endpoint>')
    expect(warnings).toEqual([])
    expect(tokens[0]?.content).toContain('&lt;&amp;&#39; &gt;')
    expect(tokens[0]?.content).not.toContain('<&')
  })
  it('does not close the component at a closing tag inside a fence', () => {
    const tokens = compile('<Endpoint>\n\n```text\n</Endpoint>\n```\n\n</Endpoint>')
    expect(warnings).toEqual([])
    expect(tokens).toHaveLength(1)
    expect(tokens[0]?.content).toContain('&lt;/Endpoint&gt;')
  })
  it.each([
    ['interpolation', '- {{ label }}: 1 js', ''],
    ['v-if', '- web: 1 js', ' v-if="show"'],
    ['custom component', '<Custom />', ''],
    ['nested list', '- web: 1 js\n  - nested: 2 css', ''],
    ['heading', '## Heading', ''],
    ['image', '- ![web](/image.png): 1 js', ''],
    ['explicit data', '- web: 1 js', ' :rows="rows"'],
    ['v-bind object', '- web: 1 js', ' v-bind="props"'],
    ['bare data prop', '- web: 1 js', ' rows'],
    ['inline HTML', '- <span>web</span>: 1 js', ''],
  ])('keeps %s as runtime slot and reports file:line', (_kind, body, attrs) => {
    const tokens = compile(`Intro\n\n<GraphStack title="X"${attrs}>\n\n${body}\n\n</GraphStack>`)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatchObject({
      file: 'fixtures/example.md',
      line: 3,
      component: 'GraphStack',
    })
    const output = md.renderer.render(tokens, md.options, {})
    expect(output).toContain(`<GraphStack title="X"${attrs}>`)
    expect(output).toContain('</GraphStack>')
    expect(output).not.toContain('v-bind="{&quot;rows')
  })
  it('does not compile fenced examples, inline code or self-closing components', () => {
    const tokens = compile(
      '```md\n<GraphStack>\n- web: 1 js\n</GraphStack>\n```\n\n`<Endpoint>`\n\n<Endpoint />',
    )
    expect(warnings).toEqual([])
    expect(tokens.some((token) => token.type === 'fence')).toBe(true)
    expect(md.renderer.render(tokens, md.options, {})).toContain('<Endpoint />')
  })
})
