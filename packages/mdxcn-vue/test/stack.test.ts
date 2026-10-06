import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Comment, Fragment, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  Bar,
  Segment,
  GraphStack,
  GraphProse,
  Graph,
  GraphBody,
  GraphRule,
  GraphRuleY,
  GraphTrack,
  GraphTick,
  stackModel,
  defineItem,
  childItems,
  flattenNodes,
  normalizeItemProps,
  proseText,
} from '../src'
import type { StackRow } from '../src'

const rows: StackRow[] = [
  {
    label: 'marketing',
    segments: [
      { label: 'js', value: 48 },
      { label: 'css', value: 22 },
      { label: 'images', value: 30 },
    ],
  },
]
const list = () => h('ul', [h('li', 'marketing: 48 js, 22 css, 30 images')])
const items = () =>
  h(Bar, { label: 'marketing' }, () => [
    h(Segment, { value: '48' }, () => 'js'),
    h(Segment, { value: 22 }, () => 'css'),
    h(Segment, { value: 30 }, () => 'images'),
  ])

afterEach(() => vi.restoreAllMocks())

describe('limited VNode adapter', () => {
  it('reads h array and string item children', () => {
    expect(
      stackModel(undefined, [h(Bar, { label: 'bundle' }, [h(Segment, { value: 1 }, 'js')])]),
    ).toEqual([{ label: 'bundle', segments: [{ label: 'js', value: 1 }] }])
  })
  it('collapses multiline prose before slicing rich labels', () => {
    const model = stackModel(undefined, [
      h('ul', [h('li', ['\n  ', h('strong', 'marketing\n  site'), ' \n :\n 48 js,\n 22 css  \n'])]),
    ])
    expect(model).toEqual([
      {
        label: 'marketing site',
        labelContent: [{ type: 'strong', children: [{ type: 'text', value: 'marketing site' }] }],
        segments: [
          { label: 'js', value: 48 },
          { label: 'css', value: 22 },
        ],
      },
    ])
    expect(stackModel(undefined, [h('ul', [h('li', '\n simple:\n 1 js\n')])])).toEqual([
      { label: 'simple', segments: [{ label: 'js', value: 1 }] },
    ])
  })
  it('unwraps fragments and drops comments without opening wrappers', () => {
    const wrapped = defineComponent({ setup: () => () => list() })
    expect(flattenNodes([h(Fragment, [h(Comment), items()]), h(wrapped)])).toHaveLength(2)
    expect(stackModel(undefined, [h(wrapped)])).toEqual([])
  })
  it('normalizes own schema, booleans, kebab-case and defaults', () => {
    const schema = {
      highValue: { type: 'number' as const, default: 12 },
      enabled: { type: 'boolean' as const },
      label: { type: 'string' as const, default: 'untitled' },
    }
    expect(normalizeItemProps({ 'high-value': '1,200', enabled: '', ignored: 7 }, schema)).toEqual({
      highValue: 1200,
      enabled: true,
      label: 'untitled',
    })
    expect(normalizeItemProps(null, schema)).toEqual({
      highValue: 12,
      enabled: false,
      label: 'untitled',
    })
    const Marker = defineItem('Marker', schema)
    expect(childItems([h(Marker, { enabled: '' })], Marker)[0]?.props.enabled).toBe(true)
  })
  it('produces the same model from all three input forms', () => {
    const expected = [
      {
        label: 'marketing',
        segments: [
          { label: 'js', value: 48 },
          { label: 'css', value: 22 },
          { label: 'images', value: 30 },
        ],
      },
    ]
    expect(stackModel(rows, [])).toEqual(expected)
    expect(stackModel(undefined, [items()])).toEqual(expected)
    expect(stackModel(undefined, [list()])).toEqual(expected)
  })
  it('prioritizes rows, then lists, then items, including empty rows', () => {
    const children = [list(), h(Bar, { label: 'ignored' })]
    expect(stackModel([], children)).toEqual([])
    expect(stackModel([{ label: 'data', segments: [] }], children)[0]?.label).toBe('data')
    expect(stackModel(null, children)[0]?.label).toBe('marketing')
    expect(stackModel(undefined, [h('ul'), items()])[0]?.label).toBe('marketing')
    expect(stackModel(undefined, [])).toEqual([])
  })
  it('preserves item array precedence and label fallback', () => {
    expect(
      stackModel(undefined, [
        h(Bar, { label: 'empty', segments: [] }, () => h(Segment, { value: 10 }, () => 'ignored')),
      ]),
    ).toEqual([{ label: 'empty', segments: [] }])
    expect(
      stackModel(undefined, [
        h(Bar, { label: 'array', segments: [{ value: '1,200', label: 'js' }] }),
      ]),
    ).toEqual([{ label: 'array', segments: [{ value: 1200, label: 'js' }] }])
    expect(
      stackModel(undefined, [
        h(Bar, { label: 'blank' }, () => h(Segment, { label: '', value: 1 }, () => 'ignored')),
      ])[0]?.segments[0]?.label,
    ).toBe('')
  })
  it('retains rich Markdown labels and ignores nested lists', () => {
    const model = stackModel(undefined, [
      h('ul', [
        h('li', [
          h('p', [h('strong', 'marketing'), ': 48 js']),
          h('ul', [h('li', 'nested: 9 css')]),
        ]),
      ]),
    ])
    expect(model).toHaveLength(1)
    expect(model[0]?.labelContent).toEqual([
      { type: 'strong', children: [{ type: 'text', value: 'marketing' }] },
    ])
    expect(proseText(model[0]?.labelContent ?? [])).toBe('marketing')
  })
})

describe('GraphStack rendering', () => {
  it('accepts string ticks without Vue warnings and normalizes invalid strings', async () => {
    const warn = vi.spyOn(console, 'warn')
    const wrapper = mount(GraphStack, { props: { title: 'string', rows, ticks: '5' } })
    expect(wrapper.get('li[aria-label]').findAll('span[aria-hidden] > span')).toHaveLength(5)
    await wrapper.setProps({ ticks: 'bad' })
    expect(wrapper.get('li[aria-label]').findAll('span[aria-hidden] > span')).toHaveLength(24)
    expect(warn).not.toHaveBeenCalled()
    wrapper.unmount()
  })
  it('caps stagger at 300ms after the seventh row', () => {
    const delays: number[] = []
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }))
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 2000,
      bottom: 2020,
    } as DOMRect)
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(private callback: IntersectionObserverCallback) {}
        observe(target: Element) {
          this.callback(
            [{ target, isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          )
        }
        disconnect() {}
      },
    )
    const animate = vi.fn((_: unknown, options: KeyframeAnimationOptions) => {
      delays.push(Number(options.delay))
      return { cancel() {}, onfinish: null }
    })
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate })
    const wrapper = mount(GraphStack, {
      props: {
        title: 'long',
        rows: Array.from({ length: 9 }, (_, index) => ({ label: String(index), segments: [] })),
      },
    })
    expect(delays).toEqual([0, 50, 100, 150, 200, 250, 300, 300, 300])
    wrapper.unmount()
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate
    vi.unstubAllGlobals()
  })
  it('renders frame, 24 ticks, legend and accessible summaries', () => {
    const wrapper = mount(GraphStack, { props: { title: 'BUNDLE', rows, palette: 'multi' } })
    expect(wrapper.get('figcaption').text()).toBe('[ BUNDLE ]')
    expect(wrapper.get('figure').attributes('aria-labelledby')).toBe(
      wrapper.get('figcaption').attributes('id'),
    )
    expect(wrapper.findAll('figure > span[aria-hidden]')).toHaveLength(4)
    const row = wrapper.get('li[aria-label]')
    expect(row.attributes('aria-label')).toBe('marketing: js 48, css 22, images 30')
    expect(row.findAll('span[aria-hidden] > span')).toHaveLength(24)
    expect(row.findAll('span[aria-hidden] > span').map((tick) => tick.text())).toEqual([
      ...Array(12).fill('█'),
      ...Array(5).fill('▓'),
      ...Array(7).fill('▒'),
    ])
    expect(wrapper.findAll('ul').at(1)?.text()).toContain('images')
    wrapper.unmount()
  })
  it('reacts when a parent replaces rows under the same key', async () => {
    const data = ref(rows)
    const wrapper = mount(
      defineComponent({
        setup: () => () => h(GraphStack, { key: 'same', title: 'update', rows: data.value }),
      }),
    )
    data.value = [{ label: 'marketing', segments: [{ label: 'new', value: 99 }] }]
    await nextTick()
    expect(wrapper.get('li[aria-label]').attributes('aria-label')).toBe('marketing: new 99')
    wrapper.unmount()
  })
  it('reparses item slots on keyed parent object replacement', async () => {
    const data = ref({ label: 'old', value: 1 })
    const Parent = defineComponent({
      setup: () => () => {
        const row = data.value
        return h(GraphStack, { key: 'same', title: 'slot update' }, () =>
          h(Bar, { label: 'stable' }, () => h(Segment, { label: row.label, value: row.value })),
        )
      },
    })
    const wrapper = mount(Parent)
    data.value = { label: 'new', value: 2 }
    await nextTick()
    expect(wrapper.get('li[aria-label]').attributes('aria-label')).toBe('stable: new 2')
    wrapper.unmount()
  })
  it('reparses Markdown slots on parent replacement', async () => {
    const data = ref({ text: 'old: 1 js' })
    const wrapper = mount(
      defineComponent({
        setup: () => () => {
          const row = data.value
          return h(GraphStack, { title: 'markdown update' }, () => h('ul', [h('li', row.text)]))
        },
      }),
    )
    data.value = { text: 'new: 2 css' }
    await nextTick()
    expect(wrapper.get('li[aria-label]').attributes('aria-label')).toBe('new: css 2')
    wrapper.unmount()
  })
  it('dims decorative glyphs but keeps legend text at full opacity', () => {
    const wrapper = mount(GraphStack, {
      props: { title: 'mono', rows, accent: 'css', glyphs: 'ascii', ticks: 5 },
    })
    const legend = wrapper.findAll('ul')[1]!
    expect(legend.findAll('li')[0]?.attributes('style')).toBeUndefined()
    expect(legend.findAll('li')[0]?.get('span[aria-hidden]').attributes('style')).toBe(
      'opacity: 0.4;',
    )
    expect(legend.findAll('li')[1]?.findAll('span')[1]?.classes()).toContain('text-foreground')
    expect(wrapper.get('li[aria-label]').findAll('span[aria-hidden] > span')).toHaveLength(5)
    wrapper.unmount()
  })
  it.each(['rows', 'markdown', 'items'])('SSR %s content has no hiding styles', async (source) => {
    const app = createSSRApp({
      render: () =>
        h(
          GraphStack,
          { title: 'SSR', ...(source === 'rows' ? { rows } : {}) },
          source === 'markdown' ? () => list() : source === 'items' ? () => items() : undefined,
        ),
    })
    const html = await renderToString(app)
    expect(html).toContain('marketing: js 48, css 22, images 30')
    expect(html).not.toMatch(/opacity:\s*0(?:;|")|translateY/)
    expect(html).not.toContain('<style')
  })
  it('hydrates SSR with stable caption IDs and identical visible content', async () => {
    const render = () => h(GraphStack, { title: 'Hydration', rows, palette: 'multi' })
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp({ render }))
    document.body.append(container)
    const before = container.innerHTML
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const client = createSSRApp({ render })
    client.mount(container)
    expect(container.innerHTML).toBe(before)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    client.unmount()
    container.remove()
  })
})

describe('frame prose', () => {
  it('renders typed strong/em/code/link nodes and frame host elements', () => {
    const wrapper = mount(GraphProse, {
      props: {
        nodes: [
          { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
          { type: 'em', children: [{ type: 'text', value: 'quiet' }] },
          { type: 'code', children: [{ type: 'text', value: 'x()' }] },
          { type: 'link', href: '/docs', children: [{ type: 'text', value: 'docs' }] },
        ],
      },
    })
    expect(wrapper.get('strong').text()).toBe('bold')
    expect(wrapper.get('em').text()).toBe('quiet')
    expect(wrapper.get('code').text()).toBe('x()')
    expect(wrapper.get('a').attributes('href')).toBe('/docs')
    const frame = mount(Graph, {
      slots: {
        default: () => [
          h(GraphBody),
          h(GraphRule),
          h(GraphRuleY),
          h(GraphTrack, null, () => h(GraphTick, null, () => '#')),
        ],
      },
    })
    expect(frame.get('figure').attributes('aria-labelledby')).toBeUndefined()
    expect(frame.get('.graph-rule').attributes('aria-hidden')).toBe('true')
    expect(frame.get('.graph-rule-y').attributes('aria-hidden')).toBe('true')
    expect(frame.find('span[aria-hidden] + span').exists()).toBe(true)
    wrapper.unmount()
    frame.unmount()
  })
})
