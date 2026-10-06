import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { Comment, Fragment, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Annotate, Env } from '../src'
import { parseAnnotatedCode, parseEnv } from '../src/core'
import { annotateModel } from '../src/adapters/annotate'
import { envModel } from '../src/adapters/env'

const retry =
  'def fetch(url, times=3):  # (1)\n    for attempt in range(times):\n        try:\n            return get(url)\n        except TimeoutError:  # (2)\n            sleep(2 ** attempt)\n    raise\n'
const notes = [
  'Three tries. Enough for a flaky network, not for a service that is down.',
  'Only timeouts retry. A 500 fails fast.',
]
const env =
  '# Postgres connection string. Required.\nDATABASE_URL=postgres://localhost:5432/app\n\n# Origin for absolute links in llms.txt\nSITE_URL=https://mdxcn.dev\n\n# Leave empty to turn analytics off\nANALYTICS_ID=\n'
const vars = [
  {
    name: 'DATABASE_URL',
    value: 'postgres://localhost:5432/app',
    note: 'Postgres connection string.',
    required: true,
  },
  {
    name: 'SITE_URL',
    value: 'https://mdxcn.dev',
    note: 'Origin for absolute links in llms.txt',
    required: false,
  },
  { name: 'ANALYTICS_ID', value: '', note: 'Leave empty to turn analytics off', required: false },
]
const pre = (text: string) => h('pre', [h('code', { class: 'language-python' }, text)])

describe('Annotate upstream fixtures and field precedence', () => {
  it.each([
    '// (1)',
    '# (1)',
    '-- (1)',
    '; (1)',
    '% (1)',
    '/* (1) */',
    '<!-- (1) -->',
    '{/* (1) */}',
  ])('reads the upstream marker %s', (marker) => {
    expect(parseAnnotatedCode(`  code  ${marker}\r\nplain\r\n\r\n`)).toEqual([
      { text: '  code', mark: 1 },
      { text: 'plain' },
    ])
  })
  it('retains blank code, zero marks and nonmatching markers', () => {
    expect(parseAnnotatedCode('')).toEqual([{ text: '' }])
    expect(parseAnnotatedCode('a // (0)\na // (100)\na // (1) tail')).toEqual([
      { text: 'a', mark: 0 },
      { text: 'a // (100)' },
      { text: 'a // (1) tail' },
    ])
  })
  it('renders retry lines, marker tone, numbered notes and upstream structure', () => {
    const wrapper = mount(Annotate, { props: { title: 'python', code: retry, notes } })
    expect(wrapper.get('figcaption').text()).toBe('[ python ]')
    expect(
      wrapper.findAll('pre code > span:last-child').map((node) => node.element.textContent),
    ).toEqual([
      'def fetch(url, times=3):',
      '    for attempt in range(times):',
      '        try:',
      '            return get(url)',
      '        except TimeoutError:',
      '            sleep(2 ** attempt)',
      '    raise',
    ])
    expect(
      wrapper.findAll('pre code > span:first-child').map((node) => node.element.textContent),
    ).toEqual(['[1]', ' ', ' ', ' ', '[2]', ' ', ' '])
    expect(wrapper.get('pre code').classes()).toEqual([
      'grid',
      'grid-cols-[2.5rem_minmax(0,1fr)]',
      'gap-x-3',
      'text-foreground',
    ])
    expect(wrapper.get('ol').attributes('role')).toBe('list')
    expect(wrapper.findAll('li > div').map((node) => node.text())).toEqual(notes)
    expect(wrapper.findAll('li > span').map((node) => node.classes().at(-1))).toEqual([
      'text-graph-accent',
      'text-graph-accent',
    ])
    expect(wrapper.get('.graph-rule').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })
  it('resolves code and notes independently, with empty values suppressing fallback', () => {
    const nodes = [pre('slot # (1)'), h('ol', [h('li', 'slot note')])]
    expect(annotateModel({ code: '' }, nodes).lines).toEqual([{ text: '' }])
    expect(annotateModel({ code: 'data', notes: [] }, nodes).notes).toEqual([])
    expect(annotateModel({ notes: ['data'] }, nodes).lines).toEqual([{ text: 'slot', mark: 1 }])
    expect(annotateModel({ code: null, notes: null }, nodes).notes).toHaveLength(1)
  })
  it('unwraps host controls, keeps rich loose notes, omits nested lists and opaque components', () => {
    const Opaque = defineComponent({ render: () => pre('hidden') })
    const wrapper = mount(Annotate, {
      slots: {
        default: () =>
          h(Fragment, [
            h(Comment),
            h(Opaque),
            h('div', { class: 'language-python vp-adaptive-theme' }, [
              h('button', 'Copy'),
              h('span', 'python'),
              pre('visible # (1)'),
            ]),
            h('ol', [
              h('li', [
                h('p', ['A ', h('strong', 'note'), ' ', h('a', { href: '/docs' }, 'link')]),
                h('p', [h('em', 'body')]),
                h('ul', [h('li', 'nested')]),
              ]),
            ]),
          ]),
      },
    })
    expect(wrapper.get('figcaption').text()).toBe('[ python ]')
    expect(wrapper.get('pre code > span:last-child').text()).toBe('visible')
    expect(wrapper.get('strong').text()).toBe('note')
    expect(wrapper.get('em').text()).toBe('body')
    expect(wrapper.get('a').attributes('href')).toBe('/docs')
    expect(wrapper.findAll('li')).toHaveLength(1)
    expect(wrapper.find('button').exists()).toBe(false)
    wrapper.unmount()
  })
  it('pads tags to the largest mark or note count and keeps zero marks muted', () => {
    const wrapper = mount(Annotate, { props: { code: 'a // (12)\nb // (0)', notes: ['one'] } })
    expect(wrapper.get('pre span').element.textContent).toBe('[12]')
    expect(wrapper.get('li > span').element.textContent).toBe('[ 1]')
    expect(wrapper.get('li > span').classes()).toContain('text-graph-muted')
    expect(wrapper.findAll('pre code')[1]?.classes()).toContain('text-graph-muted')
    wrapper.unmount()
  })
  it('accepts rich model notes and updates input without remounting', async () => {
    const wrapper = mount(Annotate, {
      props: {
        code: '',
        notes: [[{ type: 'strong', children: [{ type: 'text', value: 'rich' }] }]],
        palette: 'mono',
      },
    })
    expect(wrapper.get('strong').text()).toBe('rich')
    await wrapper.setProps({ code: 'next // (1)', notes: [] })
    expect(wrapper.find('ol').exists()).toBe(false)
    expect(wrapper.get('pre code > span:last-child').text()).toBe('next')
    expect(wrapper.get('pre span').classes()).toContain('text-graph-accent')
    wrapper.unmount()
  })
})

describe('Env independent fence/list fixtures and precedence', () => {
  it('reads the upstream .env fixture', () => expect(parseEnv(env)).toEqual(vars))
  it('keeps upstream comment, quote, invalid-line and blank-line semantics', () => {
    expect(
      parseEnv(
        '# orphan\n\n# (required): API\ninvalid\nexport A.B="hello" # inline\r\nB=\'world\'\rC="a # b"\n1BAD=x',
      ),
    ).toEqual([
      { name: 'A.B', value: 'hello', note: 'API inline', required: true },
      { name: 'B', value: 'world', note: undefined, required: false },
      { name: 'C', value: '"a', note: 'b"', required: false },
    ])
  })
  it('renders required screen-reader text, hidden glyph/legend and empty-value dash', () => {
    const wrapper = mount(Env, { props: { vars } })
    expect(wrapper.get('figcaption').text()).toBe('[ .env ]')
    expect(wrapper.get('ul').attributes('role')).toBe('list')
    expect(wrapper.findAll('li > span:nth-child(2)').map((node) => node.text())).toEqual([
      'DATABASE_URL (required)',
      'SITE_URL',
      'ANALYTICS_ID',
    ])
    expect(wrapper.findAll('li > span:nth-child(3)').map((node) => node.text())).toEqual([
      'postgres://localhost:5432/app',
      'https://mdxcn.dev',
      '—',
    ])
    expect(wrapper.get('.sr-only').text()).toBe('(required)')
    expect(wrapper.get('li > span').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('p').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('li').classes()).toContain('max-sm:grid-cols-[1.25rem_minmax(0,1fr)]')
    wrapper.unmount()
  })
  it('selects props, first pre even empty, nonempty list, then raw text', () => {
    const list = h('ul', [h('li', 'LIST: yes')])
    expect(envModel([], [pre(env), list])).toEqual([])
    expect(envModel(null, [pre(''), list, pre(env)])).toEqual([])
    expect(envModel(undefined, [pre(env), list])).toEqual(vars)
    expect(envModel(undefined, [list, h('p', 'RAW=yes')])).toEqual([
      { name: 'LIST', value: 'yes', note: undefined, required: false },
    ])
    expect(envModel(undefined, [h('ul'), h('p', 'RAW=yes')])).toEqual([
      { name: 'RAW', value: 'yes', note: undefined, required: false },
    ])
  })
  it('reads upstream worker list with bold required flags and direct li fallback', () => {
    const nodes = [
      h('li', [h('strong', 'QUEUE_URL'), ': redis://localhost:6379 — jobs and retries']),
      h('li', 'CONCURRENCY: 4 — per process'),
      h('li', 'LOG_LEVEL: info'),
    ]
    expect(envModel(undefined, nodes)).toEqual([
      {
        name: 'QUEUE_URL',
        value: 'redis://localhost:6379',
        note: 'jobs and retries',
        required: true,
      },
      { name: 'CONCURRENCY', value: '4', note: 'per process', required: false },
      { name: 'LOG_LEVEL', value: 'info', note: undefined, required: false },
    ])
  })
  it('omits nested list text but includes its bold required signal', () => {
    expect(
      envModel(undefined, [
        h('ul', [h('li', ['A: yes', h('ul', [h('li', [h('strong', 'nested')])])])]),
      ]),
    ).toEqual([{ name: 'A', value: 'yes', note: undefined, required: true }])
  })
  it('omits copy/language controls and sees reactive slot replacements', async () => {
    const text = ref('A=one')
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(Env, {}, () =>
            h('div', { class: 'language-bash' }, [
              h('button', 'Copy'),
              h('span', 'bash'),
              pre(text.value),
            ]),
          ),
      }),
    )
    expect(wrapper.get('li > span:nth-child(3)').text()).toBe('one')
    text.value = 'B=two'
    await nextTick()
    expect(wrapper.get('li > span:nth-child(2)').text()).toBe('B')
    expect(wrapper.text()).not.toContain('Copy')
    wrapper.unmount()
  })
})

describe('frame attrs and visible SSR/hydration', () => {
  it.each([Annotate, Env])('forwards frame attrs and honors an empty title for %s', (component) => {
    const wrapper = mount(component, {
      props: { title: '', corner: '*', className: 'custom' },
      attrs: { class: 'host', 'data-fixture': 'frame' },
    })
    expect(wrapper.classes()).toContain('custom')
    expect(wrapper.classes()).toContain('host')
    expect(wrapper.attributes('data-fixture')).toBe('frame')
    expect(wrapper.find('figcaption').exists()).toBe(false)
    expect(wrapper.findAll('figure > span').map((node) => node.text())).toEqual([
      '*',
      '*',
      '*',
      '*',
    ])
    wrapper.unmount()
  })
  it.each([
    [Annotate, { code: retry, notes }],
    [Env, { vars }],
  ] as [Component, object][])(
    'hydrates %s visibly with identical DOM in jsdom without IntersectionObserver',
    async (component, props) => {
      expect(typeof IntersectionObserver).toBe('undefined')
      const Host = defineComponent({ render: () => h(component, props) })
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
