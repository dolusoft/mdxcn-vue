import { flushPromises, mount } from '@vue/test-utils'
import { MarkdownDocument } from '@comark/vue'
import { parseMarkdown } from 'comark'
import examples from './fixtures/comark-examples.json'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, shallowRef, Suspense } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  coerceProps,
  createGraphComponents,
  graphComponents,
  GraphStack,
  graphTags,
  GRAPH_ADAPTERS,
} from '../src'

it.each(examples)('real Comark renders $family ($tag)', async ({ source, text, tag }) => {
  const value = await parseMarkdown(source)
  expect(value.nodes.some((node) => Array.isArray(node) && node[0] === tag)).toBe(true)
  const html = await renderToString(
    createSSRApp({ render: () => h(MarkdownDocument, { value, components: graphComponents }) }),
  )
  const container = document.createElement('div')
  container.innerHTML = html
  expect(container.querySelectorAll('figure')).toHaveLength(1)
  expect(container.textContent).toContain(text)
  expect(container.textContent).not.toContain('· · ·')
  expect(html).not.toMatch(/opacity:0(?:;|"|$)/)
})

it('real Comark hydrates pending graphs and updates body, YAML and bound numeric props', async () => {
  const value = shallowRef(await parseMarkdown('::graph-stack{title="WAIT"}\n::'))
  const Root = {
    render: () =>
      h(Suspense, null, {
        default: () => h(MarkdownDocument, { value: value.value, components: graphComponents }),
      }),
  }
  const container = document.createElement('div')
  container.innerHTML = await renderToString(createSSRApp(Root))
  expect(container.textContent).toContain('· · ·')
  document.body.append(container)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const app = createSSRApp(Root)
  try {
    app.mount(container)
    await flushPromises()
    value.value = await parseMarkdown('::graph-stack{title="BODY"}\n- first: 3 js\n::')
    await nextTick()
    expect(container.textContent).toContain('first')
    expect(container.querySelector('li[aria-label]')?.getAttribute('aria-label')).toBe(
      'first: js 3',
    )
    expect(container.textContent).not.toContain('· · ·')
    value.value = await parseMarkdown(
      '::graph-meter\n---\ntitle: BOUND\n:value: "0.5"\n:ticks: "10"\ncaption: bound meter\n---\n::',
    )
    await nextTick()
    expect(container.querySelectorAll('figure')).toHaveLength(1)
    expect(container.textContent).toContain('bound meter')
    expect(container.textContent).toContain('50%')
    expect(container.textContent).not.toContain('first')
    expect(warn.mock.calls.flat().join(' ')).not.toMatch(/hydration|mismatch|invalid prop/i)
    expect(error.mock.calls.flat().join(' ')).not.toMatch(/hydration|mismatch/i)
  } finally {
    app.unmount()
    container.remove()
    warn.mockRestore()
    error.mockRestore()
  }
})

it.each([
  {
    source:
      ':::graph-stack{title="ITEMS"}\n::bar{label="written"}\n:segment{label="ok" value=3}\n::\n:::',
    selector: 'li[aria-label]',
    expected: 'written: ok 3',
    attribute: 'aria-label',
  },
  {
    source:
      ':::graph-table{title="TABLE ITEMS"}\n::head\n:cell[Name]\n::\n::row\n:cell[Ada]\n::\n:::',
    selector: 'td',
    expected: 'Ada',
    attribute: '',
  },
])(
  'real Comark contextual item markers render $expected',
  async ({ source, selector, expected, attribute }) => {
    const value = await parseMarkdown(source)
    const html = await renderToString(
      createSSRApp({
        render: () => h(MarkdownDocument, { value, components: graphComponents }),
      }),
    )
    const container = document.createElement('div')
    container.innerHTML = html
    const item = container.querySelector(selector)
    expect(attribute ? item?.getAttribute(attribute) : item?.textContent).toBe(expected)
  },
)

it.each([
  [' 0.86 ', 0.86],
  ['0', 0],
  ['-2.5', -2.5],
  ['1e2', 100],
  ['0x10', 16],
  ['', ''],
  ['   ', '   '],
  ['NaN', 'NaN'],
  ['Infinity', 'Infinity'],
  ['1,2', '1,2'],
  [true, true],
  [null, null],
  [undefined, undefined],
  [Infinity, Infinity],
])('numeric coercion preserves upstream edge case %s', (input, expected) => {
  expect(coerceProps({ value: input }, ['value']).value).toBe(expected)
})

it('normalizes binding prefixes, kebab keys and exact booleans without mutating arrays', () => {
  const rows = [{ label: 'a' }]
  expect(
    coerceProps(
      {
        ':week-starts-on': '1',
        class: 'custom',
        caption: 'false',
        legend: 'true',
        text: 'True',
        rows,
        $meta: 1,
      },
      ['weekStartsOn'],
    ),
  ).toEqual({ weekStartsOn: 1, class: 'custom', caption: false, legend: true, text: 'True', rows })
  expect(coerceProps({ rows }).rows).toBe(rows)
})

it('prototype keys remain data properties', () => {
  const result = coerceProps(JSON.parse('{"__proto__":{"polluted":true}}'))
  expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
  expect(Object.hasOwn(result, '__proto__')).toBe(true)
})

it('full map matches the independent upstream 46 graphs plus row', () => {
  expect(graphTags).toHaveLength(47)
  expect(graphTags.sort()).toEqual(Object.keys(GRAPH_ADAPTERS).sort())
  expect(Object.keys(createGraphComponents({ 'graph-stack': GraphStack }))).toEqual([
    'row',
    'graph-stack',
  ])
  expect(() => createGraphComponents({ constructor: GraphStack } as never)).toThrow(
    'Unknown graph tag',
  )
})

it.each([undefined, null, '', '  ', []])(
  'missing required data %s renders PendingGraph',
  (rows) => {
    const wrapper = mount(graphComponents['graph-stack']!, { props: { title: 'WAIT', rows } })
    expect(wrapper.get('figure').text()).toContain('WAIT')
    expect(wrapper.text()).toContain('· · ·')
    wrapper.unmount()
  },
)

it('body bypasses required props and delegates field precedence to the existing graph', () => {
  const body = () => [h('ul', [h('li', 'first: 3 js')])]
  const written = mount(graphComponents['graph-stack']!, {
    props: { title: 'BODY' },
    slots: { default: body },
  })
  expect(written.text()).toContain('first')
  const empty = mount(graphComponents['graph-stack']!, {
    props: { title: 'BODY', rows: [] },
    slots: { default: body },
  })
  expect(empty.text()).not.toContain('first')
  expect(empty.text()).not.toContain('· · ·')
  written.unmount()
  empty.unmount()
})

it('marker tags reuse stack item schemas and preserve explicit item precedence', () => {
  const wrapper = mount(graphComponents['graph-stack']!, {
    props: { title: 'ITEMS' },
    slots: {
      default: () => [h('bar', { label: 'written' }, [h('segment', { label: 'ok', value: '3' })])],
    },
  })
  expect(wrapper.get('li[aria-label]').attributes('aria-label')).toBe('written: ok 3')
  wrapper.unmount()
})

it('row layout nested in table body resolves to the table Row marker', () => {
  const wrapper = mount(graphComponents['graph-table']!, {
    props: { title: 'ITEMS' },
    slots: {
      default: () => [
        h('head', [h('cell', 'name')]),
        h(graphComponents.row!, null, () => [h('cell', 'Ada')]),
      ],
    },
  })
  expect(wrapper.get('th').text()).toBe('name')
  expect(wrapper.get('td').text()).toBe('Ada')
  wrapper.unmount()
})

it('native class and unrelated attributes reach the figure', () => {
  const wrapper = mount(graphComponents['graph-meter']!, {
    props: { title: 'METER', value: '0.86', ticks: '28', class: 'custom', 'data-id': 'meter' },
  })
  expect(wrapper.get('figure').classes()).toContain('custom')
  expect(wrapper.get('figure').attributes('data-id')).toBe('meter')
  expect(wrapper.text()).not.toContain('· · ·')
  wrapper.unmount()
})

it('changed data remounts while cyclic keys safely fall back', async () => {
  let mounts = 0
  const Probe = defineComponent({
    setup: () => {
      mounts++
      return () => h('div')
    },
  })
  const map = createGraphComponents({ callout: Probe })
  const wrapper = mount(map.callout!, { props: { title: 'one' } })
  await wrapper.setProps({ title: 'two' })
  expect(mounts).toBe(2)
  const cycle: Record<string, unknown> = {}
  cycle.self = cycle
  await wrapper.setProps({ cycle })
  expect(wrapper.exists()).toBe(true)
  wrapper.unmount()
})

it('SSR and hydration preserve the visible pending frame and completed graph', async () => {
  const Root = {
    render: () =>
      h('div', [
        h(graphComponents['graph-stack']!, { title: 'WAIT' }),
        h(graphComponents['graph-meter']!, { title: 'READY', value: '0.86', ticks: '28' }),
      ]),
  }
  const html = await renderToString(createSSRApp(Root))
  expect(html).toContain('· · ·')
  expect(html).not.toMatch(/opacity:0(?:;|"|$)/)
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const app = createSSRApp(Root)
  app.mount(container)
  await nextTick()
  expect(warn.mock.calls.flat().join(' ')).not.toMatch(/hydration|mismatch/i)
  expect(error.mock.calls.flat().join(' ')).not.toMatch(/hydration|mismatch/i)
  expect(container.querySelectorAll('figure')).toHaveLength(2)
  app.unmount()
  container.remove()
  warn.mockRestore()
  error.mockRestore()
})
