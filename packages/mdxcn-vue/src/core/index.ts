// Framework-independent helpers for adapters and advanced consumers.
export type {
  TreeNode,
  CheckItem,
  FlowTone,
  FlowNode,
  FlowRow,
  NestedListItem,
} from './nested-flow.js'
export {
  nestedList,
  treesFromList,
  checksFromList,
  flattenTree,
  flattenChecks,
  flowNodes,
} from './nested-flow.js'
export type {
  SheetSection,
  SheetData,
  SheetModel,
  InvoiceParty,
  InvoiceMeta,
  InvoiceItem,
  InvoiceTotal,
  InvoiceData,
} from './sheet-invoice.js'
export { resolveSheet, partyOf, moneyLine, invoiceItems } from './sheet-invoice.js'
export type {
  CompareCell,
  CompareRow,
  MatrixRow,
  HeatRow,
  LabeledTableData,
} from './labeled-table.js'
export {
  compareCell,
  compareValues,
  matrixValues,
  formatMatrixCell,
  resolveLabeledTable,
  compareFromTable,
  matrixFromTable,
  heatFromTable,
} from './labeled-table.js'
export type { ProseNode, StackSegment, StackRow, SegmentRow, BarRow } from './model.js'
export { proseText, sliceProse } from './model.js'
export { words, numbers, splitDash } from './markdown.js'
export { parseInstant, pad2, formatHms, formatAgo, formatClock } from './clock.js'
export { numberOf, splitLabel, segmentsFromText, normalizeRows, resolveStackRows } from './stack.js'
export type { GraphAlign, TableCell, TableData, TableModel } from './table.js'
export { cellText, splitCells, resolveTable, toLabeledTable } from './table.js'

export { normalizeProseWhitespace } from './model.js'
export type { TerminalLine } from './terminal.js'
export { parseTerminal } from './terminal.js'
export type { CodeLine } from './annotate.js'
export { parseAnnotatedCode } from './annotate.js'
export type { EnvVar } from './env.js'
export { parseEnv, envVarFromList } from './env.js'
export type {
  StateListItem,
  StepState,
  ChangeType,
  OptionState,
  DecisionOption,
} from './state-list.js'
export { stepFromList, changeFromList, optionFromList } from './state-list.js'
export type { ChatListItem, KeyBinding } from './chat-keys.js'
export { speakerPrefix, chatFromList, bindingFromList, chordsOf } from './chat-keys.js'

export type { TimelineState } from './timeline-spec.js'
export { timelineFromList, specFromList } from './timeline-spec.js'

export { firstToken, numericFromList, scoreFromList, normalizeNumeric } from './numeric-list.js'
export type { ScoreRow, RankItem, FunnelStep, NumericRow } from './numeric-list.js'

export {
  statFromList,
  slopeFromList,
  bulletFromList,
  normalizeSlope,
  normalizeBullet,
  formatNumber,
  formatBullet,
} from './stat-slope-bullet.js'
export type { StatItem, SlopeItem, BulletItem, BulletRow } from './stat-slope-bullet.js'

export {
  ganttFromList,
  normalizeGantt,
  diffRewrite,
  diffFromList,
  waterfallFromList,
  normalizeWaterfall,
  waterfallSegments,
  formatWaterfall,
} from './gantt-diff-waterfall.js'
export type {
  GanttItem,
  GanttRow,
  DiffSign,
  DiffRow,
  DiffLineProps,
  DiffPart,
  WaterfallKind,
  WaterfallItem,
  WaterfallRow,
  WaterfallSegment,
} from './gantt-diff-waterfall.js'

export type { FaqEntry, ProseBlock, BoardItem, BoardColumn, BoardState } from './sections.js'
export { headingSections, boardFromList, normalizeBoard } from './sections.js'
