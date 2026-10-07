/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { numbers } from './markdown.js'
import { splitLabel } from './stack.js'
export interface ActivityDay {
  date: string
  count: number
}
export interface ActivityCell extends ActivityDay {
  inRange: boolean
}
export interface CalendarMark {
  day: number
  accent?: boolean
  label?: string
}
export interface CalendarWrittenMark extends CalendarMark {
  today?: boolean
}
export const DAY_MS = 86_400_000
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const
/** Match upstream UTC overflow semantics; reject malformed dates before ISO serialization. */
export function parseUTC(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return Number.NaN
  const [year, month, day] = iso.split('-').map(Number)
  return Date.UTC(year!, month! - 1, day!)
}
export function toISO(utc: number): string {
  return new Date(utc).toISOString().slice(0, 10)
}
export function activityDays(list: readonly string[], source = ''): ActivityDay[] {
  return (list.length ? list : source.split('\n')).flatMap((row) => {
    const { label, rest } = splitLabel(row.trim())
    const start = parseUTC(label)
    return Number.isFinite(start)
      ? numbers(rest).map((count, index) => ({ date: toISO(start + index * DAY_MS), count }))
      : []
  })
}
export function buildWeeks(days: readonly ActivityDay[], weekStartsOn: 0 | 1): ActivityCell[][] {
  const counts = new Map<string, number>()
  let min = Infinity,
    max = -Infinity
  for (const day of days) {
    const time = parseUTC(day.date)
    if (!Number.isFinite(time)) continue
    counts.set(day.date, day.count)
    min = Math.min(min, time)
    max = Math.max(max, time)
  }
  if (!Number.isFinite(min)) return []
  const first = min - ((new Date(min).getUTCDay() - weekStartsOn + 7) % 7) * DAY_MS
  const last = max + ((weekStartsOn + 6 - new Date(max).getUTCDay() + 7) % 7) * DAY_MS
  const weeks: ActivityCell[][] = []
  for (let time = first; time <= last; time += 7 * DAY_MS) {
    weeks.push(
      Array.from({ length: 7 }, (_, index) => {
        const current = time + index * DAY_MS,
          date = toISO(current),
          inRange = current >= min && current <= max
        return { date, inRange, count: inRange ? (counts.get(date) ?? 0) : 0 }
      }),
    )
  }
  return weeks
}
export function activityMonths(weeks: readonly (readonly ActivityCell[])[]): string[] {
  return weeks.map((week) => {
    const start = week.find(
      (cell) => cell.inRange && new Date(parseUTC(cell.date)).getUTCDate() === 1,
    )
    return start ? MONTH_NAMES[new Date(parseUTC(start.date)).getUTCMonth()]!.slice(0, 3) : ''
  })
}
export function calendarMark(text: string, strong = false): CalendarWrittenMark[] {
  const { label, rest } = splitLabel(text),
    day = Number.parseInt(label, 10)
  return Number.isFinite(day)
    ? [{ day, accent: true, label: rest || undefined, today: strong }]
    : []
}
export function calendarWeeks(
  year: number,
  month: number,
  weekStartsOn: 0 | 1,
): (number | null)[][] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const pad = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() - weekStartsOn + 7) % 7
  if (!Number.isFinite(days) || !Number.isFinite(pad)) return []
  const trailing = (7 - ((pad + days) % 7)) % 7
  const grid = [
    ...Array.from({ length: pad }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
    ...Array.from({ length: trailing }, () => null),
  ]
  return Array.from({ length: grid.length / 7 }, (_, i) => grid.slice(i * 7, i * 7 + 7))
}
