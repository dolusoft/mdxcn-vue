/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { splitLabel } from './stack.js'
import { splitDash } from './markdown.js'

export interface EnvVar {
  name: string
  value?: string
  note?: string
  required?: boolean
}
const REQUIRED = /\(?\brequired\b\)?[.:]?/i

/** Preserve upstream display parsing, including its simple inline-comment split. */
export function parseEnv(source: string): EnvVar[] {
  const vars: EnvVar[] = []
  let notes: string[] = []
  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim()
    if (!line) {
      notes = []
      continue
    }
    if (line.startsWith('#')) {
      notes.push(line.replace(/^#+\s*/, ''))
      continue
    }
    const match = line.match(/^(?:export\s+)?([A-Za-z_][\w.]*)\s*=\s*(.*)$/)
    if (!match) continue
    const [value = '', inline = ''] = (match[2] ?? '').split(/\s+#\s*/)
    const all = [...notes, inline].filter(Boolean)
    const required = all.some((note) => REQUIRED.test(note))
    const note = all
      .map((entry) => entry.replace(REQUIRED, '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join(' ')
    vars.push({
      name: match[1] ?? '',
      value: value.trim().replace(/^(['"])([\s\S]*)\1$/, '$2'),
      note: note || undefined,
      required,
    })
    notes = []
  }
  return vars
}

export function envVarFromList(text: string, required: boolean): EnvVar {
  const { label, rest } = splitLabel(text)
  const { label: value, rest: note } = splitDash(rest)
  return { name: label, value, note: note || undefined, required }
}
