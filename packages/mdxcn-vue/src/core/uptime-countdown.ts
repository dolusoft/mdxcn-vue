/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { words, splitDash } from './markdown.js'
export type UptimeStatus = 'ok' | 'degraded' | 'down' | 'empty'
export interface CountdownWritten {
  label: string
  rest: string
}
export function uptimeDays(
  value: readonly UptimeStatus[] | string | null | undefined,
): UptimeStatus[] {
  return words(value ?? undefined).flatMap((token) => {
    const match = token.match(/^(.+?)[*×](\d{1,4})$/)
    const status = match?.[1] ?? token
    return ['ok', 'degraded', 'down', 'empty'].includes(status)
      ? Array.from(
          { length: match ? Math.min(5000, Number(match[2])) : 1 },
          () => status as UptimeStatus,
        )
      : []
  })
}
export function countdownWritten(text: string): CountdownWritten {
  return splitDash(text.replace(/\s+/g, ' ').trim())
}
