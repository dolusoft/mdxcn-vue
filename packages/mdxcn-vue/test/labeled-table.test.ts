import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref, Fragment } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphCompare, GraphMatrix, GraphHeatmap, Col, Row } from '../src'
import { labeledModel } from '../src/adapters/labeled-table'
import {
  compareCell,
  compareValues,
  matrixValues,
  compareFromTable,
  matrixFromTable,
  heatFromTable,
  formatMatrixCell,
} from '../src/core'
import { numbers } from '../src/core/markdown'
import examples from './fixtures/labeled-table-examples.json'
const components: Record<string, Component> = { GraphCompare, GraphMatrix, GraphHeatmap }
const host = (columns: string[], rows: string[][]) =>
  h('table', [
    h('thead', [
      h(
        'tr',
        ['', ...columns].map((c) => h('th', c)),
      ),
    ]),
    h(
      'tbody',
      rows.map((row) =>
        h(
          'tr',
          row.map((c) => h('td', c)),
        ),
      ),
    ),
  ])
const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')
it.each(examples)('$name $props.title matches independent data, runtime and item DOM', (c) => {
  const component = components[c.name]!
  const data = mount(component, { props: { ...c.props, columns: c.columns, rows: c.rows } })
  const runtime = mount(component, {
    props: { ...c.props },
    slots: { default: () => host(c.columns, c.raw) },
  })
  const item = mount(component, {
    props: { ...c.props, ...(c.name === 'GraphCompare' ? {} : { columns: c.columns }) },
    slots: {
      default: () => [
        ...c.columns.map((col) => h(Col, null, col)),
        ...c.raw.map((row) => h(Row, { label: row[0] }, row.slice(1).join(' '))),
      ],
    },
  })
  expect(strip(runtime.html())).toBe(strip(data.html()))
  expect(strip(item.html())).toBe(strip(data.html()))
  const caption = data.get('figcaption').attributes('id')
  expect(data.get('[role=region]').attributes()).toMatchObject({
    tabindex: '0',
    'aria-labelledby': caption,
  })
  expect(data.get('table').attributes('aria-labelledby')).toBe(caption)
  expect(data.findAll('thead th[scope=col]')).toHaveLength(c.columns.length + 1)
  expect(data.findAll('tbody th[scope=row]').map((n) => n.text())).toEqual(
    c.rows.map((r) => r.label),
  )
  expect(data.find('ul').exists()).toBe(false)
  for (const w of [data, runtime, item]) w.unmount()
})
it('preserves boolean grammar and data strings while retaining empty compare cells', () => {
  expect(
    [' TRUE ', 'yes', 'X', '✓', 'false', 'NO', '–', '-', '—', '0', ''].map(compareCell),
  ).toEqual([true, true, true, true, false, false, false, false, false, '0', ''])
  expect(compareValues('yes, no  $24')).toEqual([true, false, '$24'])
  expect(compareFromTable({ label: 'a', values: ['yes', '', 'no'] }).values).toEqual([
    true,
    '',
    false,
  ])
  const w = mount(GraphCompare, {
    props: {
      title: 'T',
      columns: 'a b c d',
      accent: 'a',
      rows: [{ label: 'r', values: [true, false, 'yes'] }],
    },
  })
  expect(w.findAll('tbody td').map((n) => n.text())).toEqual(['✓', '–', 'yes', ''])
  expect(w.findAll('tbody td')[0]!.classes()).toContain('text-graph-accent')
  expect(w.findAll('tbody td')[1]!.classes()).toContain('text-graph-frame')
  expect(w.findAll('tbody td')[1]!.attributes('style')).toContain('opacity: 0.4')
  w.unmount()
})
it('preserves upstream matrix and heat text grammar, empty collapse and non-finite data', () => {
  expect(matrixValues('0x10,-2,1.25,NaN,Infinity,1e3')).toEqual([
    16,
    -2,
    1.25,
    'NaN',
    'Infinity',
    1000,
  ])
  expect(matrixFromTable({ label: 'r', values: ['1', '', '3'] }).values).toEqual([1, 3])
  expect(
    heatFromTable({ label: 'r', values: ['2*3', '', '-2', 'NaN', 'Infinity'] }).values,
  ).toEqual([2, 2, 2, -2])
  expect(formatMatrixCell(1234.25)).toBe('1,234.3')
  expect(formatMatrixCell(NaN)).toBe('NaN')
  const w = mount(GraphMatrix, {
    props: { title: 'T', columns: 'a,b,c', rows: [{ label: 'r', values: [NaN, -1234, '1.25'] }] },
  })
  expect(w.findAll('tbody td').map((n) => n.text())).toEqual(['NaN', '-1,234', '1.25'])
  w.unmount()
})
it.each([
  ['GraphCompare', compareFromTable, compareValues],
  ['GraphMatrix', matrixFromTable, matrixValues],
  ['GraphHeatmap', heatFromTable, numbers],
] as const)(
  '%s chooses each field independently and keeps custom wrappers opaque',
  (name, parse, parseText) => {
    // These calls intentionally select a union row type for the same precedence contract.
    const read = (
      data: Parameters<typeof labeledModel>[0],
      nodes: Parameters<typeof labeledModel>[1],
    ) => labeledModel(data, nodes, parse, parseText, name === 'GraphCompare')
    const nodes = [
      h(Col, null, 'item'),
      h(Row, { label: '' }, '2'),
      host(['markdown'], [['r', '3']]),
    ]
    expect(read({ columns: [], rows: [] }, nodes)).toEqual({ columns: [], rows: [] })
    expect(read({ columns: null, rows: null }, nodes)).toMatchObject({
      columns: [name === 'GraphCompare' ? 'item' : 'markdown'],
      rows: [{ label: '' }],
    })
    expect(read({ columns: 'a,b' }, [host(['m'], [['r', '3']])]).columns).toEqual(['a', 'b'])
    expect(read({}, [h(Fragment, [host(['m'], [['r', '3']])])]).columns).toEqual(['m'])
    const Wrapped = defineComponent({ render: () => host(['m'], [['r', '3']]) })
    expect(read({}, [h(Wrapped)])).toEqual({ columns: [], rows: [] })
    const table = { headers: ['', 'compiled'], rows: [['r', '4']] }
    expect(read({ table }, nodes).columns).toEqual([name === 'GraphCompare' ? 'item' : 'compiled'])
    expect(read({ table }, []).columns).toEqual(['compiled'])
  },
)
it('matches compare palette and dim branches and matrix row accent for every palette', async () => {
  const w = mount(GraphCompare, {
    props: {
      title: 'T',
      accent: 'b',
      columns: 'a b c',
      rows: [{ label: 'r', values: [true, false, 'text'] }],
    },
  })
  expect(w.findAll('tbody td')[0]!.classes()).toContain('text-foreground')
  await w.setProps({ palette: 'multi' })
  expect(w.findAll('tbody td')[0]!.classes()).toContain('text-graph-accent')
  expect(w.findAll('tbody td')[2]!.attributes('style')).toBeUndefined()
  w.unmount()
  for (const palette of ['mono', 'duo', 'multi'] as const) {
    const m = mount(GraphMatrix, {
      props: {
        title: 'T',
        columns: ['c'],
        accent: 'live',
        palette,
        rows: [
          { label: 'live', values: [1] },
          { label: 'idle', values: [2] },
        ],
      },
    })
    expect(m.get('tbody th').classes()).toContain('text-graph-accent')
    expect(m.findAll('tbody tr')[1]!.attributes('style')).toContain('opacity: 0.4')
    expect(m.findAll('tbody td .graph-rule-y')).toHaveLength(2)
    expect(m.findAll('.sr-only').at(-1)!.text()).toBe('Matrix with 2 rows and 1 columns')
    m.unmount()
  }
})
it('matches heat scale, equal/negative/NaN values, custom glyphs, missing cells and legend', async () => {
  const w = mount(GraphHeatmap, {
    props: {
      title: 'T',
      columns: 'a b c',
      rows: [{ label: 'r', values: [-2, 4, 4] }],
      caption: 'Caption',
    },
  })
  const glyphs = () => w.findAll('tbody td > [aria-hidden=true]').map((n) => n.text())
  expect(glyphs()).toEqual(['·', '█', '█'])
  expect(w.findAll('tbody td .sr-only').map((n) => n.text())).toEqual(['a -2', 'b 4', 'c 4'])
  expect(w.text()).toContain('Less')
  await w.setProps({ max: 8, glyphs: 'ascii', legend: false })
  expect(glyphs()).toEqual(['.', '=', '='])
  expect(w.text()).not.toContain('Less')
  expect(w.text()).toContain('Caption')
  await w.setProps({ rows: [{ label: 'r', values: [NaN, 4] }], max: undefined, glyphs: [] })
  expect(glyphs()).toEqual(['·', '·', '·'])
  await w.setProps({ max: 0, rows: [{ label: 'r', values: [4, 4, 4] }], caption: undefined })
  expect(glyphs()).toEqual(['·', '·', '·'])
  expect(w.find('.justify-between').exists()).toBe(false)
  w.unmount()
})
it.each(Object.entries(components))(
  '%s updates compiled host slots and props to the fresh DOM',
  async (name, component) => {
    const value = ref('1'),
      label = ref('before'),
      column = ref('A')
    const app = defineComponent({
      components: { Widget: component },
      setup: () => ({ value, label, column }),
      template:
        '<Widget title="T"><table><thead><tr><th></th><th>{{ column }}</th></tr></thead><tbody><tr v-for="i in [1,2]" :key="i"><td>{{ label }} {{ i }}</td><td><strong>{{ value }}</strong></td></tr></tbody></table></Widget>',
    })
    const w = mount(app)
    value.value = name === 'GraphCompare' ? 'yes' : '5'
    label.value = 'after'
    column.value = 'B'
    await nextTick()
    const fresh = mount(app)
    expect(strip(w.html())).toBe(strip(fresh.html()))
    expect(w.get('tbody').text()).not.toMatch(/before|object Object/)
    // A bold final label is a footer; a bold value must remain a normal row.
    expect(w.findAll('tbody tr')).toHaveLength(2)
    w.unmount()
    fresh.unmount()
  },
)
it.each(Object.entries(components))(
  '%s hydrates visible SSR without warnings and forwards attrs',
  async (_name, component) => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const app = defineComponent({
      setup: () => () =>
        h(component, { title: 'T', className: 'custom', class: 'host', 'data-test': 'yes' }, () =>
          host(['a', 'b'], [['r', '1', '2']]),
        ),
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
  },
)
it.each(Object.entries(components))(
  '%s caps the 60th observed row delay at 200ms',
  (_name, component) => {
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
    const w = mount(component, {
      props: {
        title: 'T',
        columns: ['a'],
        rows: Array.from({ length: 60 }, (_, i) => ({ label: `r${i}`, values: [1] })),
      },
    })
    const last = callbacks.find((c) => c.target === w.findAll('tbody tr')[59]!.element)!
    last.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    expect(animate.mock.calls[0]?.[1]).toMatchObject({ delay: 200 })
    w.unmount()
    Reflect.deleteProperty(HTMLElement.prototype, 'animate')
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  },
)
