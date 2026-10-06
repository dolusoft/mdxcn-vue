/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { ProseNode } from './model.js'
import { proseText } from './model.js'
import { splitDash } from './markdown.js'
import { splitLabel } from './stack.js'

/** Host-independent description; paragraphs are present only for loose lists. */
export interface StateListItem {
  /** Optional for compatibility with existing compiler inputs. */
  head?: ProseNode[]
  body?: ProseNode[][]
  text: string
  paragraphs: ProseNode[][]
  strong: boolean
  em: boolean
}
export type StepState = 'done' | 'now' | 'next'
export type ChangeType = 'add' | 'change' | 'fix' | 'remove'
export type OptionState = 'chosen' | 'open' | 'rejected'
export interface DecisionOption {
  label: string
  reason?: string
  state?: OptionState
}
export function stepFromList(item: StateListItem) {
  const { label, rest } = splitDash(item.text)
  return {
    title: item.paragraphs.length ? proseText(item.paragraphs[0]!) : label,
    body:
      item.paragraphs.length > 1
        ? item.paragraphs.slice(1)
        : item.paragraphs.length
          ? undefined
          : rest || undefined,
    state: (item.strong ? 'now' : item.em ? 'next' : 'done') as StepState,
  }
}
export function changeFromList(item: StateListItem) {
  const { label, rest } = splitLabel(item.text)
  const token = label.trim().toLowerCase()
  const type: ChangeType = ['add', 'added', '+'].includes(token)
    ? 'add'
    : ['fix', 'fixed', '*'].includes(token)
      ? 'fix'
      : ['remove', 'removed', '-'].includes(token)
        ? 'remove'
        : 'change'
  return { type, body: rest || item.text }
}
export function optionFromList(item: StateListItem): DecisionOption {
  const { label, rest } = splitDash(item.text)
  return {
    label,
    reason: rest || undefined,
    state: item.strong ? 'chosen' : item.em ? 'rejected' : 'open',
  }
}
