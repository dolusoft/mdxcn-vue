/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
export function words<T extends string>(value: readonly T[] | string | undefined): T[] {
  return value == null
    ? []
    : typeof value === 'string'
      ? (value.split(/[\s,]+/).filter(Boolean) as T[])
      : [...value]
}

/** Expand upstream run tokens such as `2*3` and `4×2` before numeric conversion. */
export function numbers(value: readonly number[] | string | undefined): number[] {
  if (value == null) return []
  if (typeof value !== 'string') return [...value]
  return words(value)
    .flatMap((token) => {
      const match = token.match(/^(.+?)[*×](\d{1,4})$/)
      return match
        ? Array.from({ length: Math.min(5000, Number(match[2])) }, () => match[1]!)
        : [token]
    })
    .map(Number)
    .filter(Number.isFinite)
}

export function splitDash(text: string): { label: string; rest: string } {
  const parts = text.split(/\s+[—–]\s+/)
  return parts.length < 2
    ? { label: text, rest: '' }
    : {
        label: (parts[0] ?? text).trim(),
        rest: parts.slice(1).join(' — ').trim(),
      }
}
