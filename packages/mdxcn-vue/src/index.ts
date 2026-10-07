// Public entry of `mdxcn-vue`; internal helpers belong to the core subpath.
export { GraphTree, Node } from './components/graph-tree.js'
export { GraphCheck, Task } from './components/graph-check.js'
export { GraphFlow, Path } from './components/graph-flow.js'
export type { GraphTreeProps } from './components/graph-tree.js'
export type { GraphCheckProps } from './components/graph-check.js'
export type { GraphFlowProps } from './components/graph-flow.js'
export type { TreeNode, CheckItem, FlowTone, FlowNode, FlowRow } from './core/nested-flow.js'
export type { NodeProps, PathProps } from './adapters/nested-flow.js'
export { GraphSheet } from './components/graph-sheet.js'
export { GraphInvoice } from './components/graph-invoice.js'
export type { GraphSheetProps } from './components/graph-sheet.js'
export type { GraphInvoiceProps } from './components/graph-invoice.js'
export { Section, From, To, Meta, Item, Total } from './adapters/sheet-invoice.js'
export type { SectionProps, MetaProps, ItemProps, TotalProps } from './adapters/sheet-invoice.js'
export type {
  SheetSection,
  SheetData,
  SheetModel,
  InvoiceParty,
  InvoiceMeta,
  InvoiceItem,
  InvoiceTotal,
  InvoiceData,
} from './core/sheet-invoice.js'
export { GraphCompare, Col } from './components/graph-compare.js'
export { GraphMatrix } from './components/graph-matrix.js'
export { GraphHeatmap } from './components/graph-heatmap.js'
export type { GraphCompareProps } from './components/graph-compare.js'
export type { GraphMatrixProps } from './components/graph-matrix.js'
export type { GraphHeatmapProps } from './components/graph-heatmap.js'
export type {
  CompareCell,
  CompareRow,
  MatrixRow,
  HeatRow,
  LabeledTableData,
} from './core/labeled-table.js'
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

export { GraphStat, Stat } from './components/graph-stat.js'
export { GraphSlope, Slope } from './components/graph-slope.js'
export { GraphBullet, Target } from './components/graph-bullet.js'
export type { GraphStatProps } from './components/graph-stat.js'
export type { GraphSlopeProps } from './components/graph-slope.js'
export type { GraphBulletProps } from './components/graph-bullet.js'
export type { StatItem, SlopeItem, BulletItem, BulletRow } from './core/stat-slope-bullet.js'

export { GraphGantt, Span } from './components/graph-gantt.js'
export { GraphDiff, Line } from './components/graph-diff.js'
export { GraphWaterfall, Delta } from './components/graph-waterfall.js'
export type { GraphGanttProps } from './components/graph-gantt.js'
export type { GraphDiffProps } from './components/graph-diff.js'
export type { GraphWaterfallProps } from './components/graph-waterfall.js'
export type {
  GanttItem,
  GanttRow,
  DiffSign,
  DiffRow,
  DiffLineProps,
  WaterfallKind,
  WaterfallItem,
  WaterfallRow,
} from './core/gantt-diff-waterfall.js'

export { Faq } from './components/faq.js'
export type { FaqProps } from './components/faq.js'
export { GraphBoard } from './components/graph-board.js'
export type { GraphBoardProps } from './components/graph-board.js'
export type { FaqEntry, ProseBlock, BoardItem, BoardColumn, BoardState } from './core/sections.js'

export { GraphBars, Series } from './components/graph-bars.js'
export { GraphSpark } from './components/graph-spark.js'
export type { GraphBarsProps } from './components/graph-bars.js'
export type { GraphSparkProps } from './components/graph-spark.js'
export type { BarSeries, SeriesProps, SeriesData } from './core/series.js'

export type { KpiData } from './core/kpi.js'
export { GraphPlot } from './components/graph-plot.js'
export type { GraphPlotProps } from './components/graph-plot.js'
export { GraphKpi } from './components/graph-kpi.js'
export type { GraphKpiProps } from './components/graph-kpi.js'

export { GraphCells, Grid } from './components/graph-cells.js'
export { GraphMeter } from './components/graph-meter.js'
export { GraphWaffle } from './components/graph-waffle.js'
export type { GraphCellsProps } from './components/graph-cells.js'
export type { GraphMeterProps } from './components/graph-meter.js'
export type { GraphWaffleProps } from './components/graph-waffle.js'
export type { CellGrid, GridProps, FractionData } from './core/grid-fraction.js'
