import { expect, it } from 'vitest'
import * as api from '../src'
import * as core from '../src/core'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'

// Deliberately maintained independently of export declarations.
const publicNames = [
  'GraphTimeline',
  'Event',
  'GraphSpec',
  'Field',
  'Chat',
  'Keys',
  'Steps',
  'Step',
  'Changelog',
  'Change',
  'Decision',
  'Callout',
  'Quote',
  'Terminal',
  'Annotate',
  'Env',
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

const publicTypes = [
  'GraphTimelineProps',
  'TimelineEvent',
  'TimelineState',
  'GraphSpecProps',
  'SpecRow',
  'SpecLine',
  'ChatProps',
  'ChatTurn',
  'KeysProps',
  'KeyBinding',
  'StepState',
  'StepProps',
  'StepsProps',
  'ChangeType',
  'ChangeProps',
  'ChangelogProps',
  'OptionState',
  'DecisionOption',
  'DecisionProps',
  'CalloutType',
  'CalloutProps',
  'QuoteProps',
  'TerminalProps',
  'AnnotateProps',
  'AnnotateNote',
  'EnvProps',
  'EnvVar',
  'ProseNode',
  'StackSegment',
  'StackRow',
  'SegmentRow',
  'BarRow',
  'GlyphSetName',
  'Glyphs',
  'GraphPalette',
  'Painted',
  'ItemField',
  'ItemSchema',
  'BarProps',
  'SegmentProps',
  'RevealOptions',
  'GraphStackProps',
  'GraphAlign',
  'TableCell',
  'TableModel',
  'TableData',
  'TableItems',
  'RowProps',
  'CellProps',
  'MarkdownTable',
  'GraphTableProps',
  'EndpointParam',
  'EndpointBlock',
  'EndpointData',
  'EndpointProps',
  'TimerKind',
  'GraphTimerProps',
]
const coreNames = [
  'TimelineState',
  'timelineFromList',
  'specFromList',
  'ChatListItem',
  'KeyBinding',
  'speakerPrefix',
  'chatFromList',
  'bindingFromList',
  'chordsOf',
  'StateListItem',
  'StepState',
  'ChangeType',
  'OptionState',
  'DecisionOption',
  'stepFromList',
  'changeFromList',
  'optionFromList',
  'CodeLine',
  'parseAnnotatedCode',
  'EnvVar',
  'parseEnv',
  'envVarFromList',
  'TerminalLine',
  'parseTerminal',
  'ProseNode',
  'StackSegment',
  'StackRow',
  'SegmentRow',
  'BarRow',
  'proseText',
  'sliceProse',
  'words',
  'numbers',
  'splitDash',
  'parseInstant',
  'pad2',
  'formatHms',
  'formatAgo',
  'formatClock',
  'numberOf',
  'splitLabel',
  'segmentsFromText',
  'normalizeRows',
  'resolveStackRows',
  'GraphAlign',
  'TableCell',
  'TableData',
  'TableModel',
  'cellText',
  'splitCells',
  'resolveTable',
  'toLabeledTable',
  'normalizeProseWhitespace',
]

it('matches every package export target and complete declaration export list', () => {
  const manifest = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
  expect(manifest.exports).toEqual({
    '.': { types: './dist/index.d.ts', import: './dist/index.js' },
    './core': { types: './dist/core/index.d.ts', import: './dist/core.js' },
    './graph.css': './dist/graph.css',
    './host.css': './dist/host.css',
    './theme.css': './dist/theme.css',
  })
  for (const entry of Object.values(manifest.exports)) {
    for (const target of typeof entry === 'string'
      ? [entry]
      : Object.values(entry as Record<string, string>)) {
      expect(
        existsSync(resolve(target)),
        `Missing ${target}; run pnpm -r build before testing`,
      ).toBe(true)
    }
  }
  for (const [path, expected] of [
    ['dist/index.d.ts', [...publicNames, ...publicTypes]],
    ['dist/core/index.d.ts', coreNames],
  ] as const) {
    const program = ts.createProgram([resolve(path)], {
      skipLibCheck: true,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      module: ts.ModuleKind.ESNext,
    })
    const checker = program.getTypeChecker()
    const symbol = checker.getSymbolAtLocation(program.getSourceFile(resolve(path))!)!
    expect(
      checker
        .getExportsOfModule(symbol)
        .map((item) => item.name)
        .sort(),
    ).toEqual([...expected].sort())
    expect(
      program
        .getSemanticDiagnostics()
        .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error),
    ).toEqual([])
  }
})
