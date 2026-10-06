import { describe, expect, it } from 'vitest'
import {
  intensityClass,
  intensityGlyph,
  intensityLevel,
  isMonoPalette,
  resolveGlyphs,
  seriesClass,
  seriesDim,
  trackMarks,
  clamp01,
  toneClass,
} from '../src/core/motion'
import { numberOf, paintRow, segmentsFromText, splitLabel, stackLegend } from '../src/core/stack'
import { proseText, sliceProse } from '../src/core/model'
import type { ProseNode } from '../src/core/model'

describe('core helpers', () => {
  it.each([
    [undefined, 9],
    [null, 9],
    ['1,200', 1200],
    ['12.5 kb', 12.5],
    ['bad', 9],
    [Infinity, 9],
    [NaN, 9],
    [-3, -3],
  ])('numberOf(%s) = %s', (value, expected) => expect(numberOf(value, 9)).toBe(expected))

  it('splits labels only on colon followed by whitespace', () => {
    expect(splitLabel(' marketing: 48 js ')).toEqual({ label: 'marketing', rest: '48 js' })
    expect(splitLabel('marketing:48 js')).toEqual({ label: 'marketing:48 js', rest: '' })
    expect(splitLabel('no colon')).toEqual({ label: 'no colon', rest: '' })
  })

  it.each([
    [
      '48 js, 22 css, 30 images',
      [
        { label: 'js', value: 48 },
        { label: 'css', value: 22 },
        { label: 'images', value: 30 },
      ],
    ],
    ['1,200 js', [{ label: 'js', value: 1200 }]],
    [
      '2.5 js, 0 css',
      [
        { label: 'js', value: 2.5 },
        { label: 'css', value: 0 },
      ],
    ],
    [
      ', 48 js, 22 css',
      [
        { label: 'js', value: 48 },
        { label: 'css', value: 22 },
      ],
    ],
    ['empty', []],
  ])('segmentsFromText: %s', (text, expected) => expect(segmentsFromText(text)).toEqual(expected))

  it('retains inline nodes when slicing labels', () => {
    const nodes: ProseNode[] = [
      {
        type: 'strong',
        children: [{ type: 'link', href: '/docs', children: [{ type: 'text', value: 'docs' }] }],
      },
      { type: 'text', value: ': 48 js' },
    ]
    expect(proseText(nodes)).toBe('docs: 48 js')
    expect(sliceProse(nodes, 1, 4)).toEqual([
      {
        type: 'strong',
        children: [{ type: 'link', href: '/docs', children: [{ type: 'text', value: 'ocs' }] }],
      },
    ])
  })
})

describe('paintRow independent fixtures', () => {
  it('distributes 48/22/30 across 24 ticks as 12/5/7', () => {
    expect(
      paintRow(
        [
          { label: 'js', value: 48 },
          { label: 'css', value: 22 },
          { label: 'images', value: 30 },
        ],
        24,
        ['█', '▓', '▒'],
      ),
    ).toEqual([
      { label: 'js', glyph: '█', count: 12, accent: true },
      { label: 'css', glyph: '▓', count: 5, accent: false },
      { label: 'images', glyph: '▒', count: 7, accent: false },
    ])
  })
  it('assigns rounding remainder to the final segment and cycles glyphs', () => {
    expect(
      paintRow(
        [
          { label: 'a', value: 1 },
          { label: 'b', value: 1 },
          { label: 'c', value: 1 },
        ],
        5,
        ['#', '='],
        'b',
      ),
    ).toEqual([
      { label: 'a', glyph: '#', count: 2, accent: false },
      { label: 'b', glyph: '=', count: 2, accent: true },
      { label: 'c', glyph: '#', count: 1, accent: false },
    ])
  })
  it('clamps over-allocation and retains upstream all-zero remainder', () => {
    const segments = ['a', 'b', 'c', 'd'].map((label) => ({ label, value: 1 }))
    expect(paintRow(segments, 2, []).map((piece) => piece.count)).toEqual([1, 1, 0, 0])
    expect(
      paintRow(
        segments.map((segment) => ({ ...segment, value: 0 })),
        4,
        [],
      ).map((piece) => piece.count),
    ).toEqual([0, 0, 0, 4])
    expect(paintRow([], 24, [])).toEqual([])
    expect(paintRow([{ label: 'a', value: 1 }], 0, [])[0]).toEqual({
      label: 'a',
      glyph: '█',
      count: 0,
      accent: true,
    })
  })
  it('preserves first-seen legend order across rows', () => {
    expect(
      stackLegend([
        {
          label: 'a',
          segments: [
            { label: 'js', value: 1 },
            { label: 'css', value: 2 },
          ],
        },
        {
          label: 'b',
          segments: [
            { label: 'css', value: 1 },
            { label: 'images', value: 2 },
          ],
        },
      ]),
    ).toEqual(['js', 'css', 'images'])
  })
})

describe('motion pure functions', () => {
  it('resolves all named glyph sets and empty-array fallback', () => {
    expect(resolveGlyphs('shade')).toEqual(['·', '░', '▒', '▓', '█'])
    expect(resolveGlyphs('ascii')).toEqual(['.', '-', '=', '#', '@'])
    expect(resolveGlyphs('hash')).toEqual(['.', ':', '+', '#', '█'])
    expect(resolveGlyphs('bar')).toEqual(['▁', '▂', '▃', '▅', '█'])
    expect(resolveGlyphs()).toEqual(['·', '░', '▒', '▓', '█'])
    expect(resolveGlyphs([])).toEqual(['·', '░', '▒', '▓', '█'])
    expect(resolveGlyphs(['x'])).toEqual(['x'])
  })
  it('maps mono, duo and multi series colors and dim opacity', () => {
    expect([0, 1, 2].map((index) => seriesClass(undefined, index))).toEqual([
      'text-graph-accent',
      'text-foreground',
      'text-foreground',
    ])
    expect([0, 1, 2].map((index) => seriesClass('duo', index))).toEqual([
      'text-graph-accent',
      'text-graph-accent-2',
      'text-graph-accent',
    ])
    expect([0, 1, 2, 3].map((index) => seriesClass('multi', index))).toEqual([
      'text-graph-accent',
      'text-graph-accent-2',
      'text-graph-accent-3',
      'text-graph-accent',
    ])
    expect(isMonoPalette()).toBe(true)
    expect(isMonoPalette('mono')).toBe(true)
    expect(isMonoPalette('duo')).toBe(false)
    expect(seriesDim('mono', false)).toEqual({ opacity: 0.4 })
    expect(seriesDim('mono', true)).toBeUndefined()
    expect(seriesDim('multi', false)).toBeUndefined()
  })
  it('maps intensity levels, clamps values and handles empty glyph sets', () => {
    expect([-1, 0, 1, 25, 50, 75, 100, 200].map((value) => intensityLevel(value, 100))).toEqual([
      0, 0, 1, 1, 2, 3, 4, 4,
    ])
    expect(intensityLevel(1, 0)).toBe(0)
    expect([-1, 1, 2, 3, 8].map((level) => intensityGlyph(level))).toEqual([
      '·',
      '░',
      '▒',
      '▓',
      '█',
    ])
    expect(intensityGlyph(3, [])).toBe('·')
    expect(intensityGlyph(2, ['.', '#'])).toBe('#')
    expect([-1, 0.5, 2].map(clamp01)).toEqual([0, 0.5, 1])
  })
  it('maps intensity palette roles independently', () => {
    expect([0, 1, 2, 3, 4].map((level) => intensityClass(level))).toEqual([
      'text-graph-frame',
      'text-graph-muted',
      'text-graph-muted',
      'text-foreground',
      'text-graph-accent',
    ])
    expect([0, 1, 2, 3, 4].map((level) => intensityClass(level, 'multi'))).toEqual([
      'text-graph-frame',
      'text-graph-accent-2',
      'text-graph-accent-3',
      'text-graph-accent-3',
      'text-graph-accent',
    ])
    expect([1, 3].map((level) => intensityClass(level, 'duo'))).toEqual([
      'text-graph-accent-2',
      'text-graph-accent',
    ])
    expect(
      ['primary', 'secondary', 'idle', 'empty'].map((role) =>
        toneClass('mono', role as 'primary' | 'secondary' | 'idle' | 'empty'),
      ),
    ).toEqual(['text-graph-accent', 'text-graph-muted', 'text-graph-muted', 'text-graph-frame'])
    expect(toneClass('duo', 'secondary')).toBe('text-graph-accent-2')
  })
  it('uses fallback and first/second/last track marks', () => {
    expect(trackMarks()).toEqual({ empty: '-', rest: '░', fill: '█' })
    expect(trackMarks(['x'])).toEqual({ empty: 'x', rest: 'x', fill: 'x' })
    expect(trackMarks('ascii')).toEqual({ empty: '.', rest: '-', fill: '@' })
  })
})
