// Public entry of `mdxcn-vue`; internal helpers belong to the core subpath.
export { default as MdxcnSmoke } from './components/MdxcnSmoke.vue'
export type { ProseNode, StackSegment, StackRow, SegmentRow, BarRow } from './core/model'
export { proseText, sliceProse } from './core/model'
export type { GlyphSetName, Glyphs, GraphPalette } from './core/motion'
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
} from './core/motion'
export type { Painted } from './core/stack'
export {
  DEFAULT_STACK_GLYPHS,
  numberOf,
  splitLabel,
  segmentsFromText,
  normalizeRows,
  paintRow,
  stackLegend,
  resolveStackRows,
} from './core/stack'
export type { ItemField, ItemSchema } from './adapters/items'
export {
  defineItem,
  flattenNodes,
  childrenOf,
  textOf,
  normalizeItemProps,
  childItems,
} from './adapters/items'
export type { BarProps, SegmentProps } from './adapters/stack'
export {
  Bar,
  Segment,
  normalizeProseWhitespace,
  readProse,
  readStackList,
  readStackItems,
  stackModel,
} from './adapters/stack'
export type { RevealOptions } from './directives/reveal'
export { vReveal } from './directives/reveal'
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
} from './components/graph-frame'
export type { GraphStackProps } from './components/graph-stack'
export { GraphStack } from './components/graph-stack'
export type { GraphAlign, TableCell, TableModel, TableData, TableItems } from './core/table'
export { cellText, splitCells, resolveTable, toLabeledTable } from './core/table'
export type { RowProps, CellProps, MarkdownTable } from './adapters/table'
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
} from './adapters/table'
export type { GraphTableProps } from './components/graph-table'
export { GraphTable } from './components/graph-table'
export type { EndpointParam, EndpointBlock, EndpointData } from './adapters/endpoint'
export { endpointModel } from './adapters/endpoint'
export type { EndpointProps } from './components/endpoint'
export { Endpoint } from './components/endpoint'
export { parseInstant, formatHms, formatAgo, formatClock } from './core/clock'
export { useGraphNow } from './composables/graph-now'
export type { TimerKind, GraphTimerProps } from './components/graph-timer'
export { GraphTimer } from './components/graph-timer'
