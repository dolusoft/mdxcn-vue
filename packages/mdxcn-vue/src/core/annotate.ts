/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
export interface CodeLine {
  text: string
  mark?: number
}
const MARKER = /\s*(?:\/\/|#|--|;|%|\/\*|<!--|\{\/\*)\s*\((\d{1,2})\)\s*(?:\*\/\}|\*\/|-->)?\s*$/

export function parseAnnotatedCode(source: string): CodeLine[] {
  return source
    .replace(/\r\n?/g, '\n')
    .replace(/\n+$/, '')
    .split('\n')
    .map((line) => {
      const match = line.match(MARKER)
      return match?.index == null
        ? { text: line }
        : { text: line.slice(0, match.index), mark: Number(match[1]) }
    })
}
