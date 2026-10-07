/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
export function parseInstant(value: Date | number | string, utc = false): number {
  if (value instanceof Date) return value.getTime()
  // Opt-in ISO-only UTC parsing keeps existing timer callers unchanged.
  if (utc && typeof value === 'string') {
    if (
      !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(
        value,
      )
    )
      return Number.NaN
    return Date.parse(
      value.includes('T') && !/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value + 'Z' : value,
    )
  }
  return typeof value === 'number'
    ? Number.isFinite(value)
      ? value
      : Number.NaN
    : Date.parse(value)
}
export function pad2(value: number): string {
  return String(Math.trunc(value)).padStart(2, '0')
}
export function formatHms(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const clock = `${pad2(Math.floor((total % 86400) / 3600))}:${pad2(Math.floor((total % 3600) / 60))}:${pad2(total % 60)}`
  return days > 0 ? `${days}d ${clock}` : clock
}
export function formatAgo(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return hours < 48 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`
}
export function formatClock(ms: number): string {
  const date = new Date(ms)
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}
