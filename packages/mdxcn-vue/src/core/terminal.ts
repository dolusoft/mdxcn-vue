/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
export interface TerminalLine {
  kind: 'command' | 'comment' | 'ok' | 'output'
  text: string
}
export function parseTerminal(source: string, prompt = '$'): TerminalLine[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  while (lines.length && !lines[0]!.trim()) lines.shift()
  while (lines.length && !lines.at(-1)!.trim()) lines.pop()
  return lines.map((raw) => {
    const text = raw.replace(/\s+$/, '')
    if (text.startsWith(`${prompt} `) || text === prompt)
      return { kind: 'command', text: text.slice(prompt.length).trimStart() }
    if (text.startsWith('#')) return { kind: 'comment', text }
    if (/^[✓✔√]/.test(text)) return { kind: 'ok', text }
    return { kind: 'output', text }
  })
}
