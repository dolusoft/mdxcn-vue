// Framework-independent helpers for adapters and advanced consumers.
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
