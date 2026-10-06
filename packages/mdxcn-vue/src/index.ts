// Public entry of `mdxcn-vue`; internal helpers belong to the core subpath.
export type { ProseNode, StackSegment, StackRow, SegmentRow, BarRow } from './core/model.js'
export { proseText, sliceProse } from './core/model.js'
export type { GlyphSetName, Glyphs, GraphPalette } from './core/motion.js'
export {
  DIM_OPACITY,
  GLYPH_SETS,
  INTENSITY_GLYPHS,
  clamp01,
  resolveGlyphs,
  trackMarks,
  intensityLevel,
  intensityGlyph,
  intensityClass,
  isMonoPalette,
  seriesClass,
  seriesDim,
  toneClass,
} from './core/motion.js'
export type { Painted } from './core/stack.js'
export {
  DEFAULT_STACK_GLYPHS,
  numberOf,
  splitLabel,
  segmentsFromText,
  normalizeRows,
  paintRow,
  stackLegend,
  resolveStackRows,
} from './core/stack.js'
export type { ItemField, ItemSchema } from './adapters/items.js'
export {
  defineItem,
  flattenNodes,
  childrenOf,
  textOf,
  normalizeItemProps,
  childItems,
} from './adapters/items.js'
export type { BarProps, SegmentProps } from './adapters/stack.js'
export {
  Bar,
  Segment,
  normalizeProseWhitespace,
  readProse,
  readStackList,
  readStackItems,
  stackModel,
} from './adapters/stack.js'
export type { RevealOptions } from './directives/reveal.js'
export { vReveal } from './directives/reveal.js'
export {
  Graph,
  GraphBody,
  GraphRule,
  GraphRuleY,
  GraphTrack,
  GraphTick,
  GraphTitle,
  GraphCorners,
  GraphProse,
  graphProseClass,
  renderProse,
} from './components/graph-frame.js'
export type { GraphStackProps } from './components/graph-stack.js'
export { GraphStack } from './components/graph-stack.js'
export type { GraphAlign, TableCell, TableModel, TableData, TableItems } from './core/table.js'
export { cellText, splitCells, resolveTable, toLabeledTable } from './core/table.js'
export type { RowProps, CellProps, MarkdownTable } from './adapters/table.js'
export {
  Head,
  Row,
  Foot,
  Cell,
  cellsOf,
  alignsOf,
  tableOf,
  labeledTable,
  tableModel,
} from './adapters/table.js'
export type { GraphTableProps } from './components/graph-table.js'
export { GraphTable } from './components/graph-table.js'
export type { EndpointParam, EndpointBlock, EndpointData } from './adapters/endpoint.js'
export { endpointModel } from './adapters/endpoint.js'
export type { EndpointProps } from './components/endpoint.js'
export { Endpoint } from './components/endpoint.js'
export { parseInstant, formatHms, formatAgo, formatClock } from './core/clock.js'
export { useGraphNow } from './composables/graph-now.js'
export type { TimerKind, GraphTimerProps } from './components/graph-timer.js'
export { GraphTimer } from './components/graph-timer.js'
export type { CalloutType, CalloutProps } from './components/callout.js'
export { Callout } from './components/callout.js'
export type { QuoteProps } from './components/quote.js'
export { Quote } from './components/quote.js'
export type { TerminalProps } from './components/terminal.js'
export { Terminal } from './components/terminal.js'
