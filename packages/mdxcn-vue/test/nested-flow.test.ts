import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, Fragment, h, nextTick, ref } from 'vue'
import type { Component, VNode } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphTree, GraphCheck, GraphFlow, Node, Task, Path, DIM_OPACITY } from '../src'
import { treeModel, checkModel, flowModel } from '../src/adapters/nested-flow'
import { flattenTree } from '../src/core'
import fixtures from './fixtures/nested-flow-examples.json'
const widgets: Record<string, Component> = { GraphTree, GraphCheck, GraphFlow }
const field = (name: string) =>
  name === 'GraphTree' ? 'nodes' : name === 'GraphCheck' ? 'items' : 'rows'
const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')
const ul = (...items: (string | VNode)[]) =>
  h(
    'ul',
    items.map((item) => (typeof item === 'string' ? h('li', item) : item)),
  )
// Independently transcribed React hosts, not constructed from the expected models.
function hosts(title: string): VNode[] {
  switch (title) {
    case 'REGISTRY':
      return [
        ul(
          h('li', [
            'registry/default',
            ul(
              h('li', ['graph-frame', ul('graph-frame.tsx — ui', 'graph-motion.ts — lib')]),
              h('li', ['graph-tree', ul(h('li', [h('strong', 'graph-tree.tsx'), ' — ui']))]),
            ),
          ]),
        ),
      ]
    case 'ON CALL':
      return [
        ul(
          h('li', [
            'platform',
            ul('api — priya', h('li', [h('strong', 'workers'), ' — jon']), 'edge — mina'),
          ]),
        ),
      ]
    case 'LAUNCH':
      return [
        ul('[x] freeze tokens', '[x] ship registry json', '[ ] write the postmortem — still open'),
      ]
    case 'REVIEW':
      return [
        ul(
          '[x] title is a sentence',
          '[x] numbers are tabular',
          '[ ] motion respects reduced — check the timer',
        ),
      ]
    case 'RELEASE':
      return [
        ul(
          '[x] freeze tokens',
          h('li', ['[ ] docs', ul('[x] grammar page', '[ ] mdx page — needs screenshots')]),
          '[ ] tag 1.3.0',
        ),
      ]
    case 'OPTIMISTIC UI':
      return [
        h('p', 'tap → server → update'),
        h('p', ['tap → ', h('strong', 'update'), ' → ', h('em', 'server syncs')]),
      ]
    default:
      return [h('p', 'write → review → ship')]
  }
}
it.each(fixtures)('$name $props.title has matching runtime model and data DOM', (c) => {
  const input = hosts(c.props.title)
  const read = c.name === 'GraphTree' ? treeModel : c.name === 'GraphCheck' ? checkModel : flowModel
  expect(JSON.parse(JSON.stringify({ [field(c.name)]: read(input) }))).toEqual(c.model)
  const runtime = mount(widgets[c.name]!, { props: c.props, slots: { default: () => input } })
  const data = mount(widgets[c.name]!, { props: { ...c.props, ...c.model } })
  expect(strip(runtime.html())).toBe(strip(data.html()))
  runtime.unmount()
  data.unmount()
})
it.each(fixtures)('$name $props.title hydrates visible SSR without warnings', async (c) => {
  vi.stubGlobal('IntersectionObserver', undefined)
  const app = defineComponent({
    setup: () => () =>
      h(widgets[c.name]!, { ...c.props, ...c.model, className: 'custom', 'data-test': 'yes' }),
  })
  const html = await renderToString(createSSRApp(app))
  expect(html).not.toMatch(/opacity:0(?:;|"|$)|translateY/)
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  const before = container.innerHTML
  const warn = vi.spyOn(console, 'warn'),
    error = vi.spyOn(console, 'error')
  const client = createSSRApp(app)
  try {
    client.mount(container)
    await nextTick()
    expect(container.innerHTML).toBe(before)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    expect(container.querySelector('figure')?.getAttribute('data-test')).toBe('yes')
    expect(container.querySelector('figure')?.classList.contains('custom')).toBe(true)
  } finally {
    client.unmount()
    container.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  }
})
it('Tree preserves single roots, sibling branches, descendant accent and meta', () => {
  const w = mount(GraphTree, { props: { title: 'T' }, slots: { default: () => hosts('REGISTRY') } })
  expect(w.findAll('li > span:first-child > span:first-child').map((n) => n.text())).toEqual([
    '',
    '├─',
    '│  ├─',
    '│  └─',
    '└─',
    '└─',
  ])
  expect(w.findAll('li').map((n) => n.attributes('style'))).toEqual([
    undefined,
    `opacity: ${DIM_OPACITY};`,
    `opacity: ${DIM_OPACITY};`,
    `opacity: ${DIM_OPACITY};`,
    undefined,
    undefined,
  ])
  expect(w.get('.sr-only').text()).toBe('Tree with 6 nodes')
  expect(
    w
      .findAll('li > span:first-child > span:first-child')
      .every((n) => n.attributes('aria-hidden') === 'true'),
  ).toBe(true)
  w.unmount()
})
it('Tree multi-root prefixes and repeated labels retain distinct keys', () => {
  expect(
    flattenTree([
      { label: 'a', children: [{ label: 'same' }, { label: 'same' }] },
      { label: 'b', children: [{ label: 'c' }] },
    ]).map((row) => [row.key, row.branch]),
  ).toEqual([
    ['root/a-0', '├─ '],
    ['root/a-0/same-0', '│  ├─ '],
    ['root/a-0/same-1', '│  └─ '],
    ['root/b-1', '└─ '],
    ['root/b-1/c-0', '   └─ '],
  ])
})
it.each(['GraphTree', 'GraphCheck', 'GraphFlow'])(
  '%s respects empty data and null fallback',
  async (name) => {
    const w = mount(widgets[name]!, {
      props: { title: 'T', [field(name)]: [] },
      slots: { default: () => [ul('a → b')] },
    })
    expect(w.text()).not.toContain('a')
    await w.setProps({ [field(name)]: null })
    expect(w.text()).toContain('a')
    w.unmount()
  },
)
it('Tree list wins at each Node depth, normalizes boolean markers and falls back only at leaves', () => {
  const input = [
    h(Node, { label: 'root' }, () => [ul('list — ui — ignored'), h(Node, { label: 'ignored' })]),
  ]
  expect(treeModel(input)).toEqual([
    {
      label: 'root',
      meta: undefined,
      accent: false,
      children: [{ label: 'list', meta: 'ui', accent: false, children: undefined }],
    },
  ])
  expect(
    treeModel([h(Node, null, () => [h(Node as Component, { accent: '' }, () => 'leaf')])]),
  ).toEqual([
    {
      label: '',
      meta: undefined,
      accent: false,
      children: [{ label: 'leaf', meta: undefined, accent: true, children: undefined }],
    },
  ])
  expect(
    treeModel([h('ul'), h(Node as Component, { label: 'fallback', accent: 'false' })])[0],
  ).toMatchObject({ label: 'fallback', accent: false })
  expect(treeModel([ul('listed'), h(Node, { label: 'ignored' })])[0]?.label).toBe('listed')
})
it('Check marker subtasks use items and ignore nested Task as a source', () => {
  expect(
    checkModel([
      h(Task as Component, { done: '', items: [{ label: 'sub', done: true }] }, () => [
        h(Task, { label: 'ignored' }),
        'root',
      ]),
    ]),
  ).toEqual([{ label: 'root', done: true, note: undefined, items: [{ label: 'sub', done: true }] }])
  expect(checkModel([h('ul'), h(Task, { label: 'fallback', done: false })])[0]?.label).toBe(
    'fallback',
  )
  expect(checkModel([ul('[X] listed'), h(Task, { label: 'ignored' })])[0]).toMatchObject({
    label: 'listed',
    done: true,
  })
})
it('Check direct checkboxes, mixed markers, nested count and note match upstream', () => {
  const input = [
    ul(
      h('li', [h('input', { type: 'checkbox', checked: true }), 'native']),
      h('li', [h('p', [h('input', { type: 'checkbox', checked: true }), 'loose'])]),
      h('li', ['[X] parent — detail', ul('[ ] child', '[?] literal')]),
    ),
  ]
  expect(checkModel(input)).toMatchObject([
    { label: 'native', done: true },
    { label: 'loose', done: false },
    {
      label: 'parent',
      done: true,
      note: 'detail',
      items: [
        { label: 'child', done: false },
        { label: '[?] literal', done: false },
      ],
    },
  ])
  const w = mount(GraphCheck, {
    props: { title: 'C', palette: 'mono' },
    slots: { default: () => input },
  })
  expect(w.get('.sr-only').text()).toBe('2 of 5 done')
  expect(w.findAll('input')).toHaveLength(0)
  expect(w.findAll('li > span[aria-hidden="true"]').map((n) => n.text())).toEqual([
    '[x]',
    '[ ]',
    '[x]',
    '[ ]',
    '[ ]',
  ])
  w.unmount()
})
it.each(['tree', 'check'])(
  '%s separates loose paragraph text and excludes nested labels',
  (kind) => {
    const input = [
      ul(
        h('li', [
          h('p', 'first'),
          h('p', 'second — note'),
          ul(h('li', [h('p', 'child'), h('p', 'continuation')])),
        ]),
      ),
    ]
    const read = kind === 'tree' ? treeModel : checkModel
    expect(read(input)[0]).toMatchObject({
      label: 'first second',
      [kind === 'tree' ? 'meta' : 'note']: 'note',
      [kind === 'tree' ? 'children' : 'items']: [{ label: 'child continuation' }],
    })
  },
)
it.each(['GraphTree', 'GraphCheck', 'GraphFlow'])(
  '%s omits header-anchor text without changing original VNodes',
  (name) => {
    const link = h('a', { class: 'header-anchor', href: '#test' }, '\u200b')
    const heading = h('h3', ['A', link, ' → B'])
    const before = { props: link.props, children: heading.children }
    const input = name === 'GraphFlow' ? [heading] : [ul(h('li', [heading]))]
    const read = name === 'GraphTree' ? treeModel : name === 'GraphCheck' ? checkModel : flowModel
    expect(JSON.stringify(read(input))).not.toMatch(/\u200b|header-anchor/)
    const marker = name === 'GraphTree' ? Node : name === 'GraphCheck' ? Task : Path
    expect(JSON.stringify(read([h(marker, null, () => [heading])]))).not.toMatch(
      /\u200b|header-anchor/,
    )
    expect(link.props).toBe(before.props)
    expect(heading.children).toBe(before.children)
  },
)
it('Flow markers outrank list and paragraphs, and raw fallback splits lines', () => {
  expect(
    flowModel([
      ul('ignored'),
      h('p', 'ignored'),
      h(Path, null, () => ['a -> ', h('strong', 'b'), ' => ', h('i', 'c')]),
    ]),
  ).toEqual([
    { nodes: [{ label: 'a' }, { label: 'b', tone: 'accent' }, { label: 'c', tone: 'muted' }] },
  ])
  expect(flowModel([h('p', 'ignored'), ul('list → wins')])).toEqual([
    { nodes: [{ label: 'list' }, { label: 'wins' }] },
  ])
  expect(flowModel([h('p', 'a → b'), h('p', 'c —> d')])).toHaveLength(2)
  expect(flowModel([h('span', 'a -> b\nc => d')])).toEqual([
    { nodes: [{ label: 'a' }, { label: 'b' }] },
    { nodes: [{ label: 'c' }, { label: 'd' }] },
  ])
  expect(flowModel([h(Path, null, () => [])])).toEqual([{ nodes: [] }])
})
it('Flow preserves inline node boundaries, empty emphasis and flattens nested list content', () => {
  expect(
    flowModel([
      h('p', ['ab', h('code', 'cd'), h('strong', ''), ' → ', h('em', [h('strong', 'next')])]),
    ]),
  ).toEqual([
    {
      nodes: [
        { label: 'ab' },
        { label: 'cd' },
        { label: '', tone: 'accent' },
        { label: 'next', tone: 'muted' },
      ],
    },
  ])
  expect(flowModel([ul(h('li', ['parent', ul('child → end')]))])).toEqual([
    { nodes: [{ label: 'parent' }, { label: 'child' }, { label: 'end' }] },
  ])
})
it('Flow stretch draws a dashed connector, palette affects labels and accent arrow stays primary', () => {
  const w = mount(GraphFlow, {
    props: {
      title: 'F',
      palette: 'mono',
      rows: [
        {
          nodes: [
            { label: 'first' },
            { label: 'next', tone: 'accent', stretch: true },
            { label: 'last', tone: 'muted' },
          ],
        },
      ],
    },
  })
  expect(w.findAll('[aria-hidden="true"] > .shrink-0').map((n) => n.text())).toEqual(['▶', '▶'])
  expect(w.findAll('.border-dashed')).toHaveLength(1)
  expect(w.get('.min-w-10').classes()).toContain('text-graph-accent')
  expect(w.get('span.shrink-0.whitespace-nowrap.text-foreground').text()).toBe('first')
  w.unmount()
})
it.each(['GraphTree', 'GraphCheck', 'GraphFlow'])(
  '%s keeps custom wrappers opaque but unwraps fragments',
  (name) => {
    const wrapper = defineComponent({ setup: () => () => ul('hidden') })
    const read = name === 'GraphTree' ? treeModel : name === 'GraphCheck' ? checkModel : flowModel
    expect(read([h(wrapper)])).toEqual([])
    expect(read([h(Fragment, [ul('visible')])])).toHaveLength(1)
  },
)
it.each(['GraphTree', 'GraphCheck', 'GraphFlow'])(
  '%s updates slot and data models reactively',
  async (name) => {
    const label = ref('first'),
      useData = ref(false)
    const model = (value: string) =>
      name === 'GraphTree'
        ? { nodes: [{ label: value }] }
        : name === 'GraphCheck'
          ? { items: [{ label: value, done: true }] }
          : { rows: [{ nodes: [{ label: value }] }] }
    const parent = defineComponent({
      setup: () => () =>
        h(widgets[name]!, { title: 'T', ...(useData.value ? model(label.value) : {}) }, () => [
          ul(label.value),
        ]),
    })
    const w = mount(parent)
    label.value = 'second'
    await nextTick()
    expect(w.text()).toContain('second')
    expect(w.text()).not.toContain('first')
    useData.value = true
    label.value = 'third'
    await nextTick()
    const fresh = mount(widgets[name]!, { props: { title: 'T', ...model('third') } })
    expect(strip(w.html())).toBe(strip(fresh.html()))
    w.unmount()
    fresh.unmount()
  },
)
it.each(['GraphTree', 'GraphCheck', 'GraphFlow'])(
  '%s caps the 60th reveal delay at 240ms',
  (name) => {
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
    const rows = Array.from({ length: 60 }, (_, index) => ({ label: String(index) }))
    const props =
      name === 'GraphTree'
        ? { nodes: rows }
        : name === 'GraphCheck'
          ? { items: rows }
          : { rows: rows.map((node) => ({ nodes: [node] })) }
    const w = mount(widgets[name]!, { props: { title: 'T', ...props } })
    try {
      expect(callbacks).toHaveLength(60)
      callbacks[59]!.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
      expect(animate.mock.calls[0]?.[1]).toMatchObject({ delay: 240 })
    } finally {
      w.unmount()
      Reflect.deleteProperty(HTMLElement.prototype, 'animate')
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
    }
  },
)
it('Tree and Check retain twelve levels without mixing ancestor text', () => {
  let node = h('li', '[x] leaf')
  for (let i = 11; i >= 0; i--) node = h('li', [`[ ] level${i}`, ul(node)])
  const input = [ul(node)]
  expect(flattenTree(treeModel(input))).toHaveLength(13)
  const w = mount(GraphCheck, { props: { title: 'D' }, slots: { default: () => input } })
  expect(w.findAll('li')).toHaveLength(13)
  expect(w.get('.sr-only').text()).toBe('1 of 13 done')
  w.unmount()
})
