import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Comment, Fragment, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  Cell,
  Foot,
  GraphTable,
  Head,
  Row,
  cellsOf,
  alignsOf,
  labeledTable,
  tableModel,
  tableOf,
  cellText,
} from '../src'
import type { TableData } from '../src'

const data: TableData = {
  headers: ['Agent', 'Tokens', 'Time'],
  rows: [
    ['Ink', '115,207', '16m'],
    ['Drift', '135,218', '16m'],
  ],
  footer: ['Total', '250,425', '32m'],
  align: ['left', 'right', 'right'],
}
const items = () => [
  h(Head, null, () => [
    h(Cell, { align: 'left' }, 'Agent'),
    h(Cell, { align: 'right' }, 'Tokens'),
    h(Cell, null, 'Time'),
  ]),
  h(Row, null, 'Ink | 115,207 | 16m'),
  h(Row, { cells: ['Drift', '135,218', '16m'] }),
  h(Foot, null, () => [h(Cell, null, 'Total'), h(Cell, null, '250,425'), h(Cell, null, '32m')]),
]
const markdown = () =>
  h('table', [
    h('thead', [
      h('tr', [
        h('th', 'Agent'),
        h('th', { style: 'text-align: right' }, 'Tokens'),
        h('th', 'Time'),
      ]),
    ]),
    h('tbody', [
      h('tr', [h('td', 'Ink'), h('td', '115,207'), h('td', '16m')]),
      h('tr', [h('td', 'Drift'), h('td', '135,218'), h('td', '16m')]),
      h('tr', [h('td', 'Total'), h('td', '250,425'), h('td', '32m')]),
    ]),
  ])

describe('table readers', () => {
  it('splits comma-separated headers and align strings like upstream words', () => {
    expect(tableModel({ headers: 'Name, Value', align: 'left, right' }, [])).toEqual({
      headers: ['Name', 'Value'],
      rows: [],
      align: ['left', 'right'],
    })
    expect(cellsOf('a,b, c')).toEqual(['a', 'b', 'c'])
  })
  it('produces an independent identical model for all three inputs', () => {
    const expected = {
      headers: ['Agent', 'Tokens', 'Time'],
      rows: [
        ['Ink', '115,207', '16m'],
        ['Drift', '135,218', '16m'],
      ],
      footer: ['Total', '250,425', '32m'],
      align: ['left', 'right', 'right'],
    }
    expect(tableModel(data, [])).toEqual(expected)
    expect(tableModel({}, items())).toEqual(expected)
    expect(tableModel({}, [markdown()])).toEqual(expected)
  })
  it('selects every field independently with data before items before Markdown', () => {
    const children = [...items(), markdown()]
    expect(
      tableModel({ headers: 'Custom | Count', rows: [], footer: [], align: 'left left' }, children),
    ).toEqual({ headers: ['Custom', 'Count'], rows: [], footer: [], align: ['left', 'left'] })
    expect(tableModel({ rows: [['data']] }, children)).toEqual({ ...data, rows: [['data']] })
    expect(tableModel({}, [h(Row, null, 'item'), markdown()])).toEqual({
      ...data,
      rows: [['item']],
    })
  })
  it('lets an empty first Head and Foot win, but absent Row items fall back', () => {
    expect(tableModel({}, [h(Head), h(Head, null, 'ignored'), h(Foot), markdown()])).toEqual({
      ...data,
      headers: [],
      footer: [],
    })
    expect(
      tableModel({ headers: null, rows: null, footer: null, align: null }, [markdown()]),
    ).toEqual(data)
    expect(tableModel({}, [])).toEqual({ headers: [], rows: [] })
  })
  it('reads pipe cells, words, nested cells, empty values and array precedence', () => {
    expect(cellsOf(' a || c ')).toEqual(['a', '', 'c'])
    expect(cellsOf('a\n b')).toEqual(['a', 'b'])
    expect(cellsOf(undefined, [h(Row, null, '')])).toEqual([])
    expect(cellsOf([], [h(Cell, null, 'ignored')])).toEqual([])
    expect(cellsOf('ignored', [h(Cell, null, 'kept')])).toEqual(['kept'])
    expect(alignsOf([h(Cell), h(Cell)])).toBeUndefined()
    expect(alignsOf([h(Cell), h(Cell, { align: 'left' }), h(Cell)])).toEqual([
      'left',
      'left',
      'right',
    ])
  })
  it('unwraps fragments and comments while leaving custom wrappers opaque', () => {
    const Wrapped = defineComponent({ render: markdown })
    expect(tableOf([h(Wrapped)])).toBeNull()
    expect(tableOf([h(Fragment, [h(Comment), markdown()])])).toEqual(data)
    expect(tableOf([h('table')])).toBeNull()
    expect(tableOf([markdown(), h('table')])).toEqual(data)
  })
  it('uses the first body row as a header when thead is absent', () => {
    expect(
      tableOf([
        h('table', [
          h('tr', [h('th', 'Name'), h('th', 'Value')]),
          h('tr', [h('td', 'a'), h('td', '1')]),
        ]),
      ]),
    ).toEqual({ headers: ['Name', 'Value'], rows: [['a', '1']] })
  })
  it.each(['strong', 'b', 'total'])(
    'recognizes a %s final total only when there are two body rows',
    (kind) => {
      const total = kind === 'total' ? 'tOtAl' : h(kind, 'Sum')
      const row = () => h('tr', [h('td', [total]), h('td', '3')])
      const header = h('thead', [h('tr', [h('th', 'Name'), h('th', 'Value')])])
      const model = tableOf([
        h('table', [header, h('tbody', [h('tr', [h('td', 'a'), h('td', '1')]), row()])]),
      ])
      expect(model?.rows).toEqual([['a', '1']])
      expect(model?.footer?.map(cellText)).toEqual([kind === 'total' ? 'tOtAl' : 'Sum', '3'])
      expect(tableOf([h('table', [header, h('tbody', [row()])])])?.footer).toBeUndefined()
    },
  )
  it('prefers explicit tfoot and leaves the written total in tbody', () => {
    const node = markdown()
    ;(node.children as ReturnType<typeof h>[]).push(h('tfoot', [h('tr', [h('td', 'Explicit')])]))
    expect(tableOf([node])?.rows).toHaveLength(3)
    expect(tableOf([node])?.footer).toEqual(['Explicit'])
  })
  it('normalizes supported header alignment and ignores center', () => {
    const table = (props: object) =>
      h('table', [h('tr', [h('th', 'a'), h('th', props, 'b'), h('th', 'c')])])
    expect(tableOf([table({ align: 'left' })])?.align).toEqual(['left', 'left', 'right'])
    expect(tableOf([table({ style: [{ textAlign: 'right' }] })])?.align).toEqual([
      'left',
      'right',
      'right',
    ])
    expect(tableOf([table({ align: 'center' })])?.align).toBeUndefined()
    expect(tableModel({ align: '' }, items()).align).toEqual([])
  })
  it('preserves supported rich cell prose and trims Markdown edge whitespace', () => {
    const model = tableOf([
      h('table', [
        h('tr', [h('th', 'Name')]),
        h('tr', [h('td', [' ', h('a', { href: '/docs' }, [h('strong', 'Docs')]), ' '])]),
      ]),
    ])
    expect(model?.rows[0]?.[0]).toEqual([
      {
        type: 'link',
        href: '/docs',
        children: [{ type: 'strong', children: [{ type: 'text', value: 'Docs' }] }],
      },
    ])
    expect(cellText(model?.rows[0]?.[0])).toBe('Docs')
  })
  it.each(['', '—', '-', 'Label'])('projects labeled tables with first header %s', (label) => {
    const table = h('table', [
      h('tr', [h('th', label), h('th', { align: 'right' }, 'Value')]),
      h('tr', [h('td', 'a'), h('td', '1')]),
    ])
    const labeled = label !== 'Label'
    expect(labeledTable([table])).toEqual({
      columns: labeled ? ['Value'] : ['Label', 'Value'],
      rows: [{ label: 'a', values: ['1'] }],
      align: labeled ? ['right'] : ['left', 'right'],
    })
    expect(labeledTable([h('table', [h('tr', [h('th', 'One')])])])).toBeNull()
  })
})

describe('GraphTable rendering', () => {
  it('renders native table sections, column scope, rules and alignment', () => {
    const wrapper = mount(GraphTable, { props: { title: 'COST', ...data } })
    expect(wrapper.get('figcaption').text()).toBe('[ COST ]')
    expect(wrapper.get('figure').attributes('aria-labelledby')).toBe(
      wrapper.get('figcaption').attributes('id'),
    )
    expect(wrapper.findAll('thead th[scope="col"]').map((cell) => cell.text())).toEqual([
      'Agent',
      'Tokens',
      'Time',
    ])
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.get('tbody td:nth-child(2)').classes()).toContain('tabular-nums')
    expect(wrapper.get('tfoot tr:last-child').text()).toBe('Total250,42532m')
    expect(wrapper.get('thead tr:last-child th').attributes('colspan')).toBe('3')
    expect(wrapper.findAll('.graph-rule')).toHaveLength(2)
    expect(wrapper.findAll('.graph-rule-y')).toHaveLength(8)
    expect(wrapper.get('table').classes()).toContain('border-separate')
    wrapper.unmount()
  })
  it('renders rich cells from typed data and nested Cell items', () => {
    const wrapper = mount(GraphTable, {
      props: {
        title: 'rich',
        headers: ['Name'],
        rows: [[[{ type: 'code', children: [{ type: 'text', value: 'x()' }] }]]],
      },
    })
    expect(wrapper.get('td code').text()).toBe('x()')
    wrapper.unmount()
    const item = mount(GraphTable, {
      props: { title: 'rich' },
      slots: {
        default: () => [
          h(Head, null, 'Name'),
          h(Row, null, () => h(Cell, null, () => h('a', { href: '/docs' }, 'Docs'))),
        ],
      },
    })
    expect(item.get('td a').attributes('href')).toBe('/docs')
    item.unmount()
  })
  it.each(['data', 'items', 'markdown'])(
    'reparses %s on parent replacement under the same key',
    async (source) => {
      const state = ref('old')
      const wrapper = mount(
        defineComponent({
          setup: () => () => {
            const value = state.value
            return h(
              GraphTable,
              {
                key: 'same',
                title: 'update',
                ...(source === 'data' ? { headers: ['Name'], rows: [[value]] } : {}),
              },
              source === 'items'
                ? () => [h(Head, null, 'Name'), h(Row, null, value)]
                : source === 'markdown'
                  ? () => h('table', [h('tr', [h('th', 'Name')]), h('tr', [h('td', value)])])
                  : undefined,
            )
          },
        }),
      )
      const figure = wrapper.get('figure').element
      state.value = 'new'
      await nextTick()
      expect(wrapper.get('tbody td').text()).toBe('new')
      expect(wrapper.get('figure').element).toBe(figure)
      wrapper.unmount()
    },
  )
  it.each(['data', 'items', 'markdown'])('SSR %s remains visible', async (source) => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            GraphTable,
            { title: 'SSR', ...(source === 'data' ? data : {}) },
            source === 'items' ? items : source === 'markdown' ? () => markdown() : undefined,
          ),
      }),
    )
    expect(html).toContain('115,207')
    expect(html).toContain('<tfoot>')
    expect(html).not.toMatch(/opacity:\s*0(?:;|")|translateY/)
    expect(html).toContain('scope="col"')
  })
  it('hydrates without warnings or changes to visible markup', async () => {
    const render = () => h(GraphTable, { title: 'hydrate', ...data })
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp({ render }))
    document.body.append(container)
    const before = container.innerHTML
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp({ render })
    app.mount(container)
    expect(container.innerHTML).toBe(before)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    app.unmount()
    container.remove()
    vi.restoreAllMocks()
  })
})
