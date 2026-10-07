import { expect, it, vi } from 'vitest'
import { parseMarkdown } from 'comark'
import { padEnd } from '../src/knap/frame.js'
import { asciiWaffle } from '../src/knap/graphs.js'
import { graphFilters } from '../src/knap/graph-knap.js'
import { toComarkBlock, toYaml } from '../src/knap/yaml.js'
import { buildWeeks, parseUTC } from '../src/core/dated-calendar.js'
import fixtures from './fixtures/knap-edge-cases.json'

it('truncates overlong padEnd text to independently captured upstream bytes', () => {
  expect(padEnd(fixtures.padEnd.text, fixtures.padEnd.size)).toBe(fixtures.padEnd.expected)
})

it('rounds fractional rank tracks to independently captured upstream bytes', () => {
  expect(graphFilters.graph_rank(JSON.stringify(fixtures.rank))).toBe(
    `\`\`\`\n${fixtures.rankExpected}\n\`\`\``,
  )
})

it('uses the default funnel locale with independently captured en-US bytes', () => {
  const nativeLocaleString = Number.prototype.toLocaleString
  const locale = vi.spyOn(Number.prototype, 'toLocaleString').mockImplementation(function (
    this: number,
  ) {
    return nativeLocaleString.call(this, 'en-US')
  })
  try {
    expect(graphFilters.graph_funnel(JSON.stringify(fixtures.funnel))).toBe(
      `\`\`\`\n${fixtures.funnelExpected}\n\`\`\``,
    )
    expect(locale).toHaveBeenCalledExactlyOnceWith()
  } finally {
    locale.mockRestore()
  }
})

it.each([
  ['flowMap', fixtures.flowMap, fixtures.flowMapExpected],
  ['nested scalar key', fixtures.nestedKey, fixtures.nestedKeyExpected],
  ['nested map key', fixtures.nestedMapKey, fixtures.nestedMapKeyExpected],
] as const)(
  'quotes %s keys and preserves the original object after real Comark parsing',
  async (_, props, expected) => {
    // Upstream bytes are stored separately: these expectations correct its known invalid YAML.
    expect(toYaml(props)).toBe(expected)
    const doc = await parseMarkdown(toComarkBlock('graph-plot', props))
    expect(doc.nodes[0]?.[1]).toEqual(
      Object.fromEntries(Object.entries(props).map(([key, value]) => [`:${key}`, value])),
    )
  },
)

it.each(fixtures.malformed)(
  '$name preserves upstream malformed output without a warning',
  (fixture) => {
    const reportWarning = vi.fn()
    const name = fixture.name as 'graph_meter' | 'graph_spec'
    expect(graphFilters[name](fixture.value, undefined, { reportWarning })).toBe(fixture.expected)
    expect(reportWarning).not.toHaveBeenCalled()
  },
)

it.each([
  { cells: 10_001 },
  { cells: 1e9 },
  { columns: 201 },
  { columns: 1e9 },
  { columns: 0.000001 },
  { columns: 1.5 },
  { cells: 1.5 },
])('rejects unsafe waffle dimensions %j with one warning and the original value', (dimensions) => {
  const reportWarning = vi.fn()
  expect(
    graphFilters.graph_waffle('original', undefined, {
      rawValue: { value: 0.5, ...dimensions },
      reportWarning,
    }),
  ).toBe('original')
  expect(reportWarning).toHaveBeenCalledExactlyOnceWith({
    code: 'FILTER_WARNING',
    message: 'Could not draw graph_waffle',
  })
  expect(() => asciiWaffle({ title: 'W', value: 0.5, ...dimensions })).toThrow(
    'Invalid waffle dimensions',
  )
})

it.each([
  { cells: 10_000, columns: 1 },
  { cells: 1, columns: 200 },
  { cells: 0, columns: 10 },
])('accepts waffle boundary dimensions %j without a warning', (dimensions) => {
  const reportWarning = vi.fn()
  expect(
    graphFilters.graph_waffle('original', undefined, {
      rawValue: { value: 0.5, ...dimensions },
      reportWarning,
    }),
  ).toMatch(/^```\n/)
  expect(reportWarning).not.toHaveBeenCalled()
})

it('rejects the expanded ISO date that overflows upstream activity week padding', () => {
  expect(parseUTC('+275760-09-13')).toBeNaN()
  expect(buildWeeks([{ date: '+275760-09-13', count: 1 }], 1)).toEqual([])
})
