import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Faq, GraphBoard } from '../src'
import type { FaqProps, GraphBoardProps } from '../src'
import { faqEntries, boardColumns } from '../src/adapters/sections'
import { headingSections, normalizeBoard } from '../src/core'
import fixtureData from './fixtures/sections-examples.json'
import { renderBlocks } from '../src/adapters/sections'
import type { ProseBlock, FaqEntry, BoardColumn } from '../src/core'
interface Example {
  name: string
  props: Record<string, string>
  entries?: FaqEntry[]
  columns?: BoardColumn[]
}
const examples = fixtureData as Example[]

const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')
const widgets: Record<string, Component> = { Faq, GraphBoard }
const propsFor = (c: (typeof examples)[number]): Record<string, unknown> => ({
  ...c.props,
  ...(c.name === 'Faq' ? { entries: c.entries } : { columns: c.columns }),
})
const hostsFor = (c: (typeof examples)[number]) =>
  c.name === 'Faq'
    ? c.entries!.flatMap((e) => [
        h('h3', e.accent ? [h('strong', e.question)] : e.question),
        ...renderBlocks(e.answer as ProseBlock[]),
      ])
    : c.columns!.flatMap((col) => [
        h('h3', col.title),
        h(
          'ul',
          col.items.map((item) => {
            const i = typeof item === 'string' ? { label: item } : item
            return h('li', [
              i.state === 'now'
                ? h('strong', i.label)
                : i.state === 'next'
                  ? h('em', i.label)
                  : i.label,
              i.note ? ` — ${i.note}` : '',
            ])
          }),
        ),
      ])

it.each(examples)(
  '$name $props.title retains independent fixture models and runtime/data DOM',
  (c) => {
    const component = widgets[c.name]!
    const hosts = hostsFor(c)
    if (c.name === 'Faq')
      expect(faqEntries(hosts)).toMatchObject(
        c.entries!.map((e) => ({ question: e.question, accent: e.accent })),
      )
    else expect(JSON.parse(JSON.stringify(boardColumns(hosts)))).toEqual(c.columns)
    const data = mount(component, { props: propsFor(c) })
    const runtime = mount(component, { props: c.props, slots: { default: () => hostsFor(c) } })
    expect(strip(runtime.html())).toBe(strip(data.html()))
    expect(data.find('table').exists()).toBe(false)
    expect(data.get('figure').attributes('aria-labelledby')).toBe(
      data.get('figcaption').attributes('id'),
    )
    if (c.name === 'Faq') {
      expect(data.get('ol').attributes('role')).toBe('list')
      expect(data.find('button, details, [aria-expanded]').exists()).toBe(false)
      expect(data.findAll('ol > li > .graph-rule')).toHaveLength(2)
      expect(data.findAll('ol > li .text-pretty')[2]!.classes()).toContain('text-graph-accent')
      expect(data.findAll('code')).toHaveLength(6)
    } else {
      expect(data.findAll('section').map((s) => s.attributes('aria-label'))).toEqual(
        c.columns!.map((col) => col.title),
      )
      expect(data.findAll('section ul[role=list]')).toHaveLength(3)
      expect(data.get('.sr-only').text()).toContain(
        c.props.title === 'ROADMAP' ? '6 items.' : '4 items.',
      )
    }
    data.unmount()
    runtime.unmount()
  },
)
it('groups direct headings once, retains empty sections and discards preamble', () => {
  expect(
    headingSections(['preamble', 'A', 'body', 'B'], (n) =>
      /^[AB]$/.test(n) ? { title: n, accent: false } : undefined,
    ),
  ).toEqual([
    { title: 'A', accent: false, children: ['body'] },
    { title: 'B', accent: false, children: [] },
  ])
  expect(
    faqEntries([h('p', 'ignored'), h('h1', '  A  '), h('h6', [h('b', 'B')]), h('p', 'body')]),
  ).toMatchObject([
    { question: 'A', answer: undefined, accent: false },
    { question: 'B', accent: true },
  ])
  expect(faqEntries([h('div', [h('h3', 'nested')]), h('p', 'body')])).toEqual([])
})
it('preserves lists, rich answers, raw strings and empty answer array truthiness', () => {
  const w = mount(Faq, {
    props: {
      entries: [
        { question: 'Empty' },
        { question: 'Array', answer: [] },
        { question: 'Literal', answer: '**literal**' },
        { question: 'Rich', answer: h('pre', [h('code', 'sample')]) },
      ],
    },
  })
  expect(w.findAll('ol > li')).toHaveLength(4)
  expect(w.findAll('ol > li .leading-relaxed')).toHaveLength(3)
  expect(w.text()).toContain('**literal**')
  expect(w.get('pre code').text()).toBe('sample')
  w.unmount()
})
it('portable tight list answers match direct runtime hosts without extra paragraphs', () => {
  const data = mount(Faq, {
    props: {
      entries: [
        {
          question: 'Q',
          answer: [
            {
              tag: 'ul',
              children: [
                {
                  tag: 'li',
                  children: [{ tag: 'inline', content: [{ type: 'text', value: 'answer' }] }],
                },
              ],
            },
          ],
        },
      ],
    },
  })
  const runtime = mount(Faq, {
    slots: { default: () => [h('h3', 'Q'), h('ul', [h('li', 'answer')])] },
  })
  expect(strip(data.html())).toBe(strip(runtime.html()))
  expect(data.find('ul li p').exists()).toBe(false)
  data.unmount()
  runtime.unmount()
})
it.each(['mono', 'duo', 'multi'] as const)(
  '%s preserves upstream question and Board state tones',
  (palette) => {
    const faq = mount(Faq, { props: { palette, entries: [{ question: 'Q', accent: true }] } })
    expect(faq.get('.text-pretty').classes()).toContain('text-graph-accent')
    const board = mount(GraphBoard, {
      props: {
        title: 'B',
        palette,
        columns: [
          {
            title: 'C',
            items: [{ label: 'Now', state: 'now' }, { label: 'Next', state: 'next' }, 'Done'],
          },
        ],
      },
    })
    expect(board.findAll('li .text-pretty').map((n) => n.attributes('class'))).toEqual([
      'text-pretty text-graph-accent',
      `text-pretty ${palette === 'mono' ? 'text-graph-muted' : 'text-graph-accent-2'}`,
      'text-pretty text-foreground',
    ])
    faq.unmount()
    board.unmount()
  },
)
it('board ignores tables and nested list text, while nested bold still selects now', () => {
  const nodes = [
    h('h3', 'A'),
    h('table', [h('tr', [h('td', 'ignored')])]),
    h('ul', [h('li', ['plain — note', h('ul', [h('li', [h('strong', 'nested')])])])]),
    h('h3', 'Empty'),
  ]
  expect(boardColumns(nodes)).toEqual([
    { title: 'A', items: [{ label: 'plain', note: 'note', state: 'now' }] },
    { title: 'Empty', items: [] },
  ])
  const w = mount(GraphBoard, { props: { title: 'T' }, slots: { default: () => nodes } })
  expect(w.findAll('section')).toHaveLength(2)
  expect(w.findAll('section li')).toHaveLength(1)
  expect(w.get('.sr-only').text()).toBe('A: 1, Empty: 0. 1 items.')
  w.unmount()
})
it('normalizes strings without Markdown parsing and caps columns before totals', () => {
  const columns = Array.from({ length: 5 }, (_, i) => ({
    title: `c${i}`,
    items: ['**literal**', { label: 'n', state: 'next' as const }],
  }))
  expect(normalizeBoard(columns)).toHaveLength(4)
  const w = mount(GraphBoard, { props: { title: 'T', columns } })
  expect(w.findAll('section')).toHaveLength(4)
  expect(w.get('.sr-only').text()).toContain('8 items.')
  expect(w.text()).not.toContain('c4')
  expect(w.text()).toContain('**literal**')
  w.unmount()
})
it.each(['Faq', 'GraphBoard'])(
  '%s explicit empty data overrides hosts and null falls back',
  async (name) => {
    const c = examples.find((e) => e.name === name)!
    const field = name === 'Faq' ? 'entries' : 'columns'
    const w = mount(widgets[name]!, {
      props: { ...c.props, [field]: [] },
      slots: { default: () => hostsFor(c) },
    })
    expect(w.findAll(name === 'Faq' ? 'ol > li' : 'section')).toHaveLength(0)
    await w.setProps({ [field]: null })
    expect(w.findAll(name === 'Faq' ? 'ol > li' : 'section')).toHaveLength(3)
    w.unmount()
  },
)
it.each(['Faq', 'GraphBoard'])(
  '%s reparses compiled reactive slots without cloning',
  async (name) => {
    const title = ref('before'),
      value = ref('old'),
      count = ref(2)
    const app = defineComponent({
      components: { Widget: widgets[name]! },
      setup: () => ({ title, value, count }),
      template:
        name === 'Faq'
          ? '<Widget title="T"><template v-for="i in count" :key="i"><h3><strong>{{title}} {{i}}</strong></h3><p><code>{{value}}</code></p></template></Widget>'
          : '<Widget title="T"><h3>{{title}}</h3><ul><li v-for="i in count" :key="i"><strong>{{value}} {{i}}</strong> — note</li></ul></Widget>',
    })
    const w = mount(app)
    title.value = 'after'
    value.value = 'new'
    count.value = 3
    await nextTick()
    const fresh = mount(app)
    expect(strip(w.html())).toBe(strip(fresh.html()))
    expect(w.text()).not.toMatch(/before|old|object Object/)
    expect(w.text()).toContain('new')
    w.unmount()
    fresh.unmount()
  },
)
it.each(['Faq', 'GraphBoard'])(
  '%s updates typed props with the same DOM as a fresh mount',
  async (name) => {
    const props: FaqProps | GraphBoardProps =
      name === 'Faq'
        ? { entries: [{ question: 'a', answer: 'old' }] }
        : { title: 'T', columns: [{ title: 'a', items: ['old'] }] }
    const next =
      name === 'Faq'
        ? { entries: [{ question: 'b', answer: 'new', accent: true }] }
        : { columns: [{ title: 'b', items: [{ label: 'new', state: 'now' as const }] }] }
    const w = mount(widgets[name]!, { props })
    await w.setProps(next)
    const fresh = mount(widgets[name]!, { props: { ...props, ...next } })
    expect(strip(w.html())).toBe(strip(fresh.html()))
    w.unmount()
    fresh.unmount()
  },
)
it.each(examples)('$name $props.title hydrates visible SSR without warnings', async (c) => {
  vi.stubGlobal('IntersectionObserver', undefined)
  const app = defineComponent({
    setup: () => () =>
      h(widgets[c.name]!, {
        ...propsFor(c),
        className: 'custom',
        class: 'host',
        'data-test': 'yes',
      }),
  })
  const html = await renderToString(createSSRApp(app))
  expect(html).not.toMatch(/opacity:0|translateY/)
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  const before = container.innerHTML,
    warn = vi.spyOn(console, 'warn'),
    error = vi.spyOn(console, 'error')
  const client = createSSRApp(app)
  client.mount(container)
  await nextTick()
  expect(container.innerHTML).toBe(before)
  expect(warn).not.toHaveBeenCalled()
  expect(error).not.toHaveBeenCalled()
  expect(container.querySelector('figure')!.classList.contains('custom')).toBe(true)
  expect(container.querySelector('figure')!.getAttribute('data-test')).toBe('yes')
  client.unmount()
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it.each(['Faq', 'GraphBoard'])('%s caps the 60th item reveal delay', (name) => {
  const callbacks: { target?: Element; callback: IntersectionObserverCallback }[] = []
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      entry: { target?: Element; callback: IntersectionObserverCallback }
      constructor(callback: IntersectionObserverCallback) {
        this.entry = { callback }
        callbacks.push(this.entry)
      }
      observe(target: Element) {
        this.entry.target = target
      }
      disconnect() {}
    },
  )
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 10000,
    bottom: 10020,
    left: 0,
    right: 100,
  } as DOMRect)
  const animate = vi.fn<
    (frames: Keyframe[], options: KeyframeAnimationOptions) => { cancel(): void; onfinish: null }
  >(() => ({ cancel() {}, onfinish: null }))
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate })
  const props: Record<string, unknown> =
    name === 'Faq'
      ? { entries: Array.from({ length: 60 }, (_, i) => ({ question: `q${i}`, answer: 'a' })) }
      : {
          title: 'T',
          columns: [{ title: 'c', items: Array.from({ length: 60 }, (_, i) => `i${i}`) }],
        }
  const w = mount(widgets[name]!, { props })
  const last = callbacks.find(
    (c) => c.target === w.findAll(name === 'Faq' ? 'ol > li' : 'section li')[59]!.element,
  )!
  last.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
  expect(animate.mock.calls[0]?.[1]).toMatchObject({ delay: name === 'Faq' ? 300 : 200 })
  w.unmount()
  Reflect.deleteProperty(HTMLElement.prototype, 'animate')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
