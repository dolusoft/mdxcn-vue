import { expect, it } from 'vitest'
import * as api from '../src'
import * as core from '../src/core'

// Deliberately maintained independently of export declarations.
const publicNames = [
  'Bar',
  'Cell',
  'DEFAULT_STACK_GLYPHS',
  'DIM_OPACITY',
  'Endpoint',
  'Foot',
  'GLYPH_SETS',
  'Graph',
  'GraphBody',
  'GraphCorners',
  'GraphProse',
  'GraphRule',
  'GraphRuleY',
  'GraphStack',
  'GraphTable',
  'GraphTick',
  'GraphTimer',
  'GraphTitle',
  'GraphTrack',
  'Head',
  'INTENSITY_GLYPHS',
  'MdxcnSmoke',
  'Row',
  'Segment',
  'alignsOf',
  'cellText',
  'cellsOf',
  'childItems',
  'childrenOf',
  'clamp01',
  'defineItem',
  'endpointModel',
  'flattenNodes',
  'formatAgo',
  'formatClock',
  'formatHms',
  'graphProseClass',
  'intensityClass',
  'intensityGlyph',
  'intensityLevel',
  'isMonoPalette',
  'labeledTable',
  'normalizeItemProps',
  'normalizeProseWhitespace',
  'normalizeRows',
  'numberOf',
  'paintRow',
  'parseInstant',
  'proseText',
  'readProse',
  'readStackItems',
  'readStackList',
  'renderProse',
  'resolveGlyphs',
  'resolveStackRows',
  'resolveTable',
  'segmentsFromText',
  'seriesClass',
  'seriesDim',
  'sliceProse',
  'splitCells',
  'splitLabel',
  'stackLegend',
  'stackModel',
  'tableModel',
  'tableOf',
  'textOf',
  'toLabeledTable',
  'toneClass',
  'trackMarks',
  'useGraphNow',
  'vReveal',
]

it('matches the reviewed public export snapshot', () => {
  expect(Object.keys(api).sort()).toEqual([...publicNames].sort())
})
it('exposes grammar and clock helpers only through core', () => {
  for (const name of ['words', 'numbers', 'splitDash', 'pad2']) {
    expect(api).not.toHaveProperty(name)
    expect(core).toHaveProperty(name)
  }
  for (const name of ['rowsIn', 'hostCells']) expect(api).not.toHaveProperty(name)
})
