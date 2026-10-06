// Framework-independent helpers for adapters and advanced consumers.
export type { ProseNode, StackSegment, StackRow, SegmentRow, BarRow } from './model'
export { proseText, sliceProse } from './model'
export { words, numbers, splitDash } from './markdown'
export { parseInstant, pad2, formatHms, formatAgo, formatClock } from './clock'
export { numberOf, splitLabel, segmentsFromText, normalizeRows, resolveStackRows } from './stack'
export type { GraphAlign, TableCell, TableData, TableModel } from './table'
export { cellText, splitCells, resolveTable, toLabeledTable } from './table'
