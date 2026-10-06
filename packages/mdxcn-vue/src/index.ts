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
export type { AnnotateNote } from './adapters/annotate.js'
export type { AnnotateProps } from './components/annotate.js'
export { Annotate } from './components/annotate.js'
export type { EnvVar } from './core/env.js'
export type { EnvProps } from './components/env.js'
export { Env } from './components/env.js'
export { Steps, Step } from './components/steps.js'
export type { StepsProps, StepProps } from './components/steps.js'
export { Changelog, Change } from './components/changelog.js'
export type { ChangelogProps, ChangeProps } from './components/changelog.js'
export { Decision } from './components/decision.js'
export type { DecisionProps } from './components/decision.js'
export type { StepState, ChangeType, OptionState, DecisionOption } from './core/state-list.js'
export { Chat } from './components/chat.js'
export type { ChatProps } from './components/chat.js'
export type { ChatTurn } from './adapters/chat.js'
export { Keys } from './components/keys.js'
export type { KeysProps } from './components/keys.js'
export type { KeyBinding } from './core/chat-keys.js'

export { GraphTimeline, Event } from './components/graph-timeline.js'
export type { GraphTimelineProps } from './components/graph-timeline.js'
export type { TimelineEvent, SpecRow, SpecLine } from './adapters/timeline-spec.js'
export type { TimelineState } from './core/timeline-spec.js'
export { GraphSpec, Field } from './components/graph-spec.js'
export type { GraphSpecProps } from './components/graph-spec.js'

export { GraphScore } from './components/graph-score.js'
export { GraphRank, Rank } from './components/graph-rank.js'
export { GraphFunnel, Stage } from './components/graph-funnel.js'
export type {
  GraphScoreProps,
  GraphRankProps,
  GraphFunnelProps,
} from './components/numeric-list.js'
export type { ScoreRow, RankItem, FunnelStep } from './core/numeric-list.js'
