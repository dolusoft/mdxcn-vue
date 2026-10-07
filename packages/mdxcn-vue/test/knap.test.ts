import { expect, it, vi } from 'vitest'
import { parseMarkdown } from 'comark'
import {
  createGraphFilters,
  GRAPH_FILTER_SLUGS,
  graphFilters,
  graphFilterNames,
  graphFilterMetadata,
  resolveGraphProps,
} from '../src/knap/graph-knap.js'
import type { GraphFilterName } from '../src/knap/graph-knap.js'
import { asciiWaffle } from '../src/knap/graphs.js'
import fixtures from './fixtures/knap-upstream.json'

// Captured by executing shadcn-labs/mdxcn@16d817a, never by executing the port.
it.each(fixtures)('$name matches the independently captured upstream bytes', (fixture) => {
  const reportWarning = vi.fn()
  const output = graphFilters[fixture.name as GraphFilterName](fixture.value, fixture.param, {
    reportWarning,
  })
  expect(Buffer.from(output)).toEqual(Buffer.from(fixture.expected))
  expect(reportWarning).not.toHaveBeenCalled()
})

it('covers all 46 names, including all 39 ASCII drawers and seven Comark defaults', () => {
  expect(fixtures.map((f) => f.name).sort()).toEqual([...graphFilterNames].sort())
  expect(fixtures.filter((f) => f.expected.startsWith('```'))).toHaveLength(39)
  expect(GRAPH_FILTER_SLUGS).toHaveLength(46)
  expect(Object.keys(graphFilterMetadata).sort()).toEqual([...graphFilterNames].sort())
  expect(graphFilterMetadata.graph_meter).toEqual({ example: 'graph_meter:"TITLE"' })
  expect(graphFilterMetadata.graph_plot).toEqual({ example: 'graph_plot:"comark"' })
})
it('selects only requested filters without changing function identity', () => {
  expect(createGraphFilters(['graph_meter', 'graph_table', 'graph_meter'])).toEqual({
    graph_meter: graphFilters.graph_meter,
    graph_table: graphFilters.graph_table,
  })
  expect(createGraphFilters([])).toEqual({})
})
it('prefers typed raw values and preserves the caller object', () => {
  const rawValue = { value: 0, title: 'Original' }
  const context = { rawValue, rawArguments: ['ignored'] }
  expect(resolveGraphProps('graph-meter', 'invalid', '" Override "', context)).toEqual({
    props: { value: 0, title: 'Override' },
    format: 'ascii',
  })
  expect(rawValue.title).toBe('Original')
  expect(graphFilters.graph_meter('invalid', undefined, context)).toContain('0%')
})
it.each([0, false, '', null])('preserves explicit raw value %s', (rawValue) => {
  expect(resolveGraphProps('graph-meter', '0.5', undefined, { rawValue })?.props.value).toBe(
    rawValue,
  )
})
it('falls back from undefined raw value to JSON and assigns scalar graph defaults', () => {
  expect(resolveGraphProps('graph-meter', '0.5', undefined, { rawValue: undefined })).toEqual({
    props: { title: 'METER', value: 0.5 },
    format: 'ascii',
  })
  expect(resolveGraphProps('quote', 'Read docs.', undefined)).toEqual({
    props: { body: 'Read docs.' },
    format: 'ascii',
  })
})
it('converts records to a table using first-record keys and literal cell strings', () => {
  expect(
    resolveGraphProps(
      'graph-table',
      JSON.stringify([
        { a: true, b: { x: 1 } },
        { a: null, c: 4 },
      ]),
      undefined,
    )?.props,
  ).toEqual({
    title: 'TABLE',
    headers: ['a', 'b'],
    rows: [
      ['true', '{"x":1}'],
      ['', ''],
    ],
  })
})
it.each(['', 'undefined', 'null'])('warns once and retains unreadable input %s', (value) => {
  const reportWarning = vi.fn()
  expect(graphFilters.graph_meter(value, undefined, { reportWarning })).toBe(value)
  expect(reportWarning).toHaveBeenCalledExactlyOnceWith({
    message: 'Could not read graph_meter data',
    code: 'INVALID_FILTER_INPUT',
  })
})
it('warns and returns the original value when the ASCII drawer rejects data', () => {
  const reportWarning = vi.fn()
  expect(graphFilters.graph_rank('oops', undefined, { reportWarning })).toBe('oops')
  expect(reportWarning).toHaveBeenCalledExactlyOnceWith({
    message: 'Could not draw graph_rank',
    code: 'FILTER_WARNING',
  })
})
it('also contains resolution errors and cyclic Comark serialization errors', () => {
  const cyclic: Record<string, unknown> = {}
  cyclic.self = cyclic
  for (const [name, rawValue, param] of [
    ['graph_table', [{ x: cyclic }], undefined],
    ['graph_plot', cyclic, 'comark'],
  ] as const) {
    const reportWarning = vi.fn()
    expect(graphFilters[name]('original', param, { rawValue, reportWarning })).toBe('original')
    expect(reportWarning).toHaveBeenCalledOnce()
  }
})
it.each([0, -1, Infinity, NaN])('rejects unbounded waffle columns %s before drawing', (columns) => {
  const reportWarning = vi.fn()
  expect(
    graphFilters.graph_waffle('original', undefined, {
      rawValue: { value: 0.5, columns },
      reportWarning,
    }),
  ).toBe('original')
  expect(reportWarning).toHaveBeenCalledOnce()
})
it.each([0, -1, Infinity, NaN])('asciiWaffle rejects columns %s without looping', (columns) => {
  expect(() => asciiWaffle({ title: 'W', value: 0.5, columns })).toThrow(
    'Invalid waffle dimensions',
  )
})
it('lengthens the fence when multi-line cell text could close it early', () => {
  const evil = 'a\n```\n<img src=x onerror=alert(1)>\n````\nb'
  const cases = [
    ['graph_meter', { value: 0.5, title: evil, caption: evil }],
    ['graph_stat', { items: [{ value: evil, label: evil, hint: evil }] }],
    ['graph_table', { headers: [evil], rows: [[evil]] }],
    ['graph_tree', { nodes: [{ label: evil }] }],
  ] as const
  for (const [name, rawValue] of cases) {
    const lines = graphFilters[name]('ignored', undefined, { rawValue }).split('\n')
    const open = /^`+$/.exec(lines[0]!)?.[0] ?? ''
    expect(open.length).toBeGreaterThan(4)
    const closes = (line: string) => (/^ {0,3}(`+)\s*$/.exec(line)?.[1]?.length ?? 0) >= open.length
    expect(lines.slice(1, -1).filter(closes)).toEqual([])
    expect(lines.at(-1)).toBe(open)
  }
  expect(graphFilters.graph_meter('0.5', 'X')).toMatch(/^```\n[^`]*\n```$/)
})
it('explicit comark overrides ASCII and preserves nested objects, grids, YAML-like strings and keys', async () => {
  const rawValue = {
    value: 0.5,
    title: 'true',
    'odd:key': 'null',
    nested: { empty: {}, flag: 'false' },
    grids: [
      [1, 0],
      [0, 1],
    ],
    rows: [{ nested: { value: 'no' } }],
    body: 'Read **docs**.',
  }
  const output = graphFilters.graph_meter('ignored', 'comark', { rawValue })
  const doc = await parseMarkdown(output)
  expect(doc.nodes[0]?.[0]).toBe('graph-meter')
  // Comark prefixes bound/non-string attributes with ':' and stringifies numeric scalars.
  expect(doc.nodes[0]?.[1]).toEqual({
    ':value': '0.5',
    title: 'true',
    'odd:key': 'null',
    ':nested': { empty: {}, flag: 'false' },
    ':grids': [
      [1, 0],
      [0, 1],
    ],
    ':rows': [{ nested: { value: 'no' } }],
  })
  expect(output).toContain('Read **docs**.')
})
it('rejects non-finite YAML values and unsupported scalar values with a warning', () => {
  for (const value of [Infinity, 1n, () => 1]) {
    const reportWarning = vi.fn()
    expect(
      graphFilters.graph_plot('original', 'comark', { rawValue: { value }, reportWarning }),
    ).toBe('original')
    expect(reportWarning).toHaveBeenCalledOnce()
  }
})
it('preserves empty maps and mixed nested sequences after omitting undefined fields', async () => {
  const output = graphFilters.graph_plot('ignored', 'comark', {
    rawValue: { nested: { omitted: undefined }, mixed: [{}, null, [1]] },
  })
  const doc = await parseMarkdown(output)
  expect(doc.nodes[0]?.[1]).toEqual({ title: 'PLOT', ':nested': {}, ':mixed': [{}, null, [1]] })
})
