/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { ProseNode } from './model.js'
import { proseText, sliceProse } from './model.js'
import { splitLabel } from './stack.js'
import type { StateListItem } from './state-list.js'

export interface ChatListItem {
  head: ProseNode[]
  body: ProseNode[][]
}
export interface KeyBinding {
  keys: string
  action: string
  accent?: boolean
}
export const speakerPrefix = (text: string) => text.match(/^\s*([^:\n]{1,24}):\s*/)
export function chatFromList(item: ChatListItem) {
  const match = speakerPrefix(proseText(item.head))
  if (!match) return []
  const head = sliceProse(item.head, match[0].length, proseText(item.head).length)
  const parts = head.filter((node) => proseText([node]).trim() !== '')
  return [
    {
      by: (match[1] ?? '').trim(),
      head,
      body: item.body,
      aside: item.body.length === 0 && parts.length === 1 && parts[0]?.type === 'em',
    },
  ]
}
export function bindingFromList(item: StateListItem): KeyBinding {
  const { label, rest } = splitLabel(item.text)
  return { keys: label, action: rest, accent: item.strong }
}
const modifiers = new Set(['⌘', '⌥', '⇧', '⌃', '⎋', '↵', '⌫', '⇥'])
export function chordsOf(keys: string): string[][] {
  return keys
    .split(/\s+then\s+/i)
    .map((chord) =>
      chord
        .split(/\s*\+\s*|\s+/)
        .filter(Boolean)
        .flatMap((token) => {
          const glyphs = [...token]
          const lead = glyphs.findIndex((glyph) => !modifiers.has(glyph))
          if (lead <= 0) return lead === -1 ? glyphs : [token]
          return [...glyphs.slice(0, lead), glyphs.slice(lead).join('')]
        }),
    )
    .filter((chord) => chord.length > 0)
}
