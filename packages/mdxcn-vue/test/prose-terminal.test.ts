import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Comment, Fragment, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Callout, Quote, Terminal } from '../src'
import { parseTerminal } from '../src/core'
import { terminalModel } from '../src/adapters/terminal'

const install =
  '$ pnpm dlx shadcn@latest add @mdxcn/callout\n✓ registry/default/callout/callout.tsx\n✓ registry/default/graph-frame/graph-frame.tsx\n  2 files written, 0 conflicts'
const warning =
  'The CLI copies files into registry/default. It does not add an npm dependency, so there is nothing to update later — edit the source.'
const quote = 'A thousand barely audible voices all singing in tune.'

describe('upstream prose fixtures', () => {
  it.each([
    ['note', 'i', 'text-graph-muted'],
    ['tip', '+', 'text-graph-accent'],
    ['warning', '!', 'text-graph-accent'],
    ['danger', '×', 'text-destructive'],
  ] as const)(
    'renders %s with the independent glyph, tone, note role and caption relation',
    (type, glyph, tone) => {
      const wrapper = mount(Callout, { props: { type }, slots: { default: () => h('p', warning) } })
      expect(wrapper.element.tagName).toBe('FIGURE')
      expect(wrapper.attributes('role')).toBe('note')
      expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.get('figcaption').attributes('id'))
      expect(wrapper.get('figcaption').text()).toBe(`[ ${type} ]`)
      expect(wrapper.get('.grid > span').attributes('aria-hidden')).toBe('true')
      expect(wrapper.get('.grid > span').text()).toBe(glyph)
      expect(wrapper.get('.grid > span').classes()).toContain(tone)
      expect(wrapper.get('p').text()).toBe(warning)
      expect(wrapper.get('figure > div').classes()).toEqual([
        'min-w-0',
        'px-5',
        'sm:px-8',
        'py-6',
        'sm:py-6',
      ])
      wrapper.unmount()
    },
  )
  it('keeps titled tip lists and rich prose, with attrs on the frame', () => {
    const wrapper = mount(Callout, {
      props: { type: 'tip', title: 'Palette', corner: '*', className: 'custom' },
      attrs: { class: 'host', 'data-fixture': 'tip' },
      slots: {
        default: () => [
          h('p', ['One ', h('strong', 'accent'), ' ', h('a', { href: '/docs' }, 'Docs')]),
          h('ul', [h('li', 'palette="duo" for two series'), h('li', 'palette="multi" for three')]),
        ],
      },
    })
    expect(wrapper.get('figcaption').text()).toBe('[ Palette ]')
    expect(wrapper.findAll('li').map((node) => node.text())).toEqual([
      'palette="duo" for two series',
      'palette="multi" for three',
    ])
    expect(wrapper.get('strong').text()).toBe('accent')
    expect(wrapper.get('a').attributes('href')).toBe('/docs')
    expect(wrapper.classes()).toContain('custom')
    expect(wrapper.classes()).toContain('host')
    expect(wrapper.attributes('data-fixture')).toBe('tip')
    expect(wrapper.findAll('figure > span').map((node) => node.text())).toEqual([
      '*',
      '*',
      '*',
      '*',
    ])
    wrapper.unmount()
  })
  it('defaults to note and permits an empty title', () => {
    const wrapper = mount(Callout)
    expect(wrapper.get('figcaption').text()).toBe('[ note ]')
    wrapper.unmount()
    const empty = mount(Callout, { props: { title: '' } })
    expect(empty.find('figcaption').exists()).toBe(false)
    expect(empty.attributes('aria-labelledby')).toBeUndefined()
    empty.unmount()
  })
  it('renders upstream attributed quote without a title and with a semantic cite', () => {
    const wrapper = mount(Quote, {
      props: { by: 'Paul Graham', source: 'Taste for Makers' },
      slots: { default: () => h('p', quote) },
    })
    expect(wrapper.find('figcaption').exists()).toBe(false)
    expect(wrapper.get('blockquote').classes()).toEqual(['m-0', 'flex', 'flex-col', 'gap-5', 'p-0'])
    expect(wrapper.get('p').text()).toBe(quote)
    expect(wrapper.get('blockquote > div > span').text()).toBe('“')
    expect(wrapper.get('blockquote > div > span').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('cite').text()).toBe('Paul Graham')
    expect(wrapper.get('footer .text-graph-muted').text()).toBe('Taste for Makers')
    expect(wrapper.get('.graph-rule').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('footer > span').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })
  it.each([
    [{ by: 'Dieter Rams', title: 'PRINCIPLE' }, true, 'Dieter Rams', ''],
    [{ source: 'Notes' }, true, '', 'Notes'],
    [{ by: '', source: '' }, false, '', ''],
    [{}, false, '', ''],
  ])('selects attribution only from props %j', (props, footer, by, source) => {
    const wrapper = mount(Quote, {
      props,
      slots: { default: () => h('p', 'Good design is as little design as possible.') },
    })
    expect(wrapper.find('footer').exists()).toBe(footer)
    expect(wrapper.find('cite').exists()).toBe(Boolean(by))
    if (by) expect(wrapper.get('cite').text()).toBe(by)
    if (source) expect(wrapper.get('footer .text-graph-muted').text()).toBe(source)
    if ('title' in props) expect(wrapper.get('figcaption').text()).toBe('[ PRINCIPLE ]')
    wrapper.unmount()
  })
})

describe('Terminal normalization and independent upstream fixtures', () => {
  it('preserves ordinary wrappers whose class only contains a language substring', () => {
    expect(
      terminalModel(undefined, [
        h('div', { class: 'not-language-console' }, [
          h('span', 'ordinary text'),
          h('pre', ' code'),
        ]),
      ]),
    ).toEqual([{ kind: 'output', text: 'ordinary text code' }])
  })
  it('parses install commands, success marks and indented output', () => {
    expect(parseTerminal(install)).toEqual([
      { kind: 'command', text: 'pnpm dlx shadcn@latest add @mdxcn/callout' },
      { kind: 'ok', text: '✓ registry/default/callout/callout.tsx' },
      { kind: 'ok', text: '✓ registry/default/graph-frame/graph-frame.tsx' },
      { kind: 'output', text: '  2 files written, 0 conflicts' },
    ])
  })
  it('normalizes CR, CRLF, trailing whitespace and outer blanks while keeping interior whitespace', () => {
    expect(
      parseTerminal(
        '\r\n  \r$ run  \r\n\n  output \t\n$\n# comment\n✔ yes\n√ yes\n ✓ indented\n\n',
      ),
    ).toEqual([
      { kind: 'command', text: 'run' },
      { kind: 'output', text: '' },
      { kind: 'output', text: '  output' },
      { kind: 'command', text: '' },
      { kind: 'comment', text: '# comment' },
      { kind: 'ok', text: '✔ yes' },
      { kind: 'ok', text: '√ yes' },
      { kind: 'output', text: ' ✓ indented' },
    ])
    expect(parseTerminal(' \n\t')).toEqual([])
  })
  it('matches comment and output example with a custom prompt and leading spaces', () => {
    expect(
      parseTerminal(
        '# run the suite once\n> pnpm test\n RUN  v3.2.7\n ✓ lib/http/accept.test.ts (12)\n ✓ lib/agent/copy.test.ts (4)\n Test Files  2 passed (2)',
        '>',
      ),
    ).toEqual([
      { kind: 'comment', text: '# run the suite once' },
      { kind: 'command', text: 'pnpm test' },
      { kind: 'output', text: ' RUN  v3.2.7' },
      { kind: 'output', text: ' ✓ lib/http/accept.test.ts (12)' },
      { kind: 'output', text: ' ✓ lib/agent/copy.test.ts (4)' },
      { kind: 'output', text: ' Test Files  2 passed (2)' },
    ])
  })
  it('supports multi-character and empty prompts without inventing commands', () => {
    expect(parseTerminal('>>> run\n>>>\n>>>other\n$ run', '>>>')).toEqual([
      { kind: 'command', text: 'run' },
      { kind: 'command', text: '' },
      { kind: 'output', text: '>>>other' },
      { kind: 'output', text: '$ run' },
    ])
    expect(parseTerminal(' run', '')).toEqual([{ kind: 'command', text: 'run' }])
  })
  it('reads text and fences through fragments, ignores comments and custom components', () => {
    const Opaque = defineComponent({ render: () => h('pre', '$ hidden') })
    const nodes = [
      h(Fragment, [h(Comment, 'ignored'), h(Opaque), h('pre', [h('code', '$ visible\n')])]),
    ]
    expect(terminalModel(undefined, nodes)).toEqual([{ kind: 'command', text: 'visible' }])
    expect(terminalModel(null, nodes)).toEqual([{ kind: 'command', text: 'visible' }])
    expect(terminalModel('', nodes)).toEqual([])
    expect(terminalModel('replacement', nodes)).toEqual([{ kind: 'output', text: 'replacement' }])
  })
  it('unwraps VitePress highlighted fences and excludes copy and language UI', () => {
    expect(
      terminalModel(undefined, [
        h('div', { class: ['vp-adaptive-theme', { 'language-console': true }] }, [
          h('button', { class: 'copy' }, 'Copy'),
          h('span', { class: 'lang' }, 'console'),
          h('pre', [h('code', [h('span', '$ '), h('span', 'run'), '\n  output\n'])]),
        ]),
      ]),
    ).toEqual([
      { kind: 'command', text: 'run' },
      { kind: 'output', text: '  output' },
    ])
  })
  it('renders each install line as an upstream grid with hidden prompt and exact text', () => {
    const wrapper = mount(Terminal, { props: { text: install } })
    expect(wrapper.get('figcaption').text()).toBe('[ shell ]')
    expect(wrapper.get('pre').classes()).toEqual([
      'm-0',
      'flex',
      'min-w-max',
      'flex-col',
      'gap-0.5',
      'leading-relaxed',
      'whitespace-pre',
    ])
    expect(
      wrapper.findAll('pre > code > span:last-child').map((node) => node.element.textContent),
    ).toEqual([
      'pnpm dlx shadcn@latest add @mdxcn/callout',
      '✓ registry/default/callout/callout.tsx',
      '✓ registry/default/graph-frame/graph-frame.tsx',
      '  2 files written, 0 conflicts',
    ])
    expect(wrapper.findAll('pre > code').map((node) => node.classes().at(-1))).toEqual([
      'text-foreground',
      'text-graph-accent',
      'text-graph-accent',
      'text-graph-muted',
    ])
    expect(
      wrapper.findAll('code > span:first-child').map((node) => node.attributes('aria-hidden')),
    ).toEqual(['true', 'true', 'true', 'true'])
    wrapper.unmount()
  })
  it('keeps blank displayed lines, observes slot replacements and honors empty text', async () => {
    const text = ref('$ first\n\noutput')
    const Host = defineComponent({ setup: () => () => h(Terminal, {}, () => h('pre', text.value)) })
    const wrapper = mount(Host)
    expect(
      wrapper.findAll('code > span:last-child').map((node) => node.element.textContent),
    ).toEqual(['first', ' ', 'output'])
    text.value = '$ second'
    await nextTick()
    expect(wrapper.get('code > span:last-child').text()).toBe('second')
    wrapper.unmount()
    const empty = mount(Terminal, {
      props: { text: '' },
      slots: { default: () => h('pre', '$ ignored') },
    })
    expect(empty.findAll('code')).toHaveLength(0)
    empty.unmount()
  })
})

describe('visible SSR and hydration parity', () => {
  it.each([
    [Callout, { type: 'warning' }, warning, 'p'],
    [Quote, { by: 'Paul Graham', source: 'Taste for Makers' }, quote, 'p'],
    [Terminal, { text: install }, '', 'pre'],
  ] as [Component, Record<string, string>, string, string][])(
    'hydrates %s without mismatch or hidden SSR content',
    async (component, props, body, tag) => {
      const Host = defineComponent({ render: () => h(component, props, () => h(tag, body)) })
      const html = await renderToString(createSSRApp(Host))
      expect(html).not.toMatch(/opacity:\s*0|translateY/)
      const container = document.createElement('div')
      container.innerHTML = html
      document.body.append(container)
      const before = container.innerHTML
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const app = createSSRApp(Host)
      try {
        app.mount(container)
        await nextTick()
        expect(container.innerHTML).toBe(before)
        expect(warn).not.toHaveBeenCalled()
        expect(error).not.toHaveBeenCalled()
      } finally {
        app.unmount()
        container.remove()
        warn.mockRestore()
        error.mockRestore()
      }
    },
  )
})
