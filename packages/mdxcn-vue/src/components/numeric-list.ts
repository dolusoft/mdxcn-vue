/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { h, mergeProps, withDirectives } from 'vue'
import type { SetupContext } from 'vue'
import type { Glyphs, GraphPalette } from '../core/motion.js'
import { trackMarks, toneClass, isMonoPalette, seriesClass, seriesDim } from '../core/motion.js'
import type { ScoreRow, RankItem, FunnelStep } from '../core/numeric-list.js'
import { numericFromList, scoreFromList, normalizeNumeric } from '../core/numeric-list.js'
import type { StateListItem } from '../core/state-list.js'
import { numberOf } from '../core/stack.js'
import { numericList, numericItems, Rank, Stage } from '../adapters/numeric-list.js'
import { vReveal } from '../directives/reveal.js'
import { Graph, GraphBody, GraphTrack, GraphTick } from './graph-frame.js'
export interface NumericProps {
  title: string
  list?: readonly StateListItem[] | null
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}
export interface GraphScoreProps extends NumericProps {
  items?: readonly ScoreRow[] | null
  max?: number
}
export interface GraphRankProps extends NumericProps {
  ticks?: number | string
  items?: readonly RankItem[] | null
  max?: number
}
export interface GraphFunnelProps extends NumericProps {
  ticks?: number | string
  steps?: readonly FunnelStep[] | null
  stage?: string
}
const formatScore = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1))
export function numericSetup(
  kind: 'Score' | 'Rank' | 'Funnel',
  props: NumericProps & {
    ticks?: number | string
    items?: readonly ScoreRow[] | readonly RankItem[] | null
    steps?: readonly FunnelStep[] | null
    max?: number
    stage?: string
  },
  { slots, attrs }: SetupContext,
) {
  return () => {
    const nodes = slots.default?.() ?? []
    const list = props.list ?? numericList(nodes)
    const score = kind === 'Score'
    const rank = kind === 'Rank'
    const rows = score
      ? ((props.items as readonly ScoreRow[] | null | undefined) ?? list.map(scoreFromList))
      : normalizeNumeric(
          ((rank ? props.items : props.steps) as readonly RankItem[] | null | undefined) ??
            (list.length || props.list != null
              ? list.map(numericFromList)
              : numericItems(nodes, rank ? Rank : Stage)),
        )
    const scores = rows as readonly ScoreRow[]
    const fallback = props.max ?? scores.find((row) => row.max)?.max ?? 5
    const peak = rank
      ? (props.max ?? Math.max(...rows.map((row) => row.value), 1))
      : Math.max(...rows.map((row) => row.value), 1)
    const head = rows[0]?.value || 1
    const ticks = numberOf(props.ticks, 20)
    const marks = trackMarks(
      props.glyphs,
      score
        ? { empty: '○', rest: '◐', fill: '●' }
        : rank
          ? { empty: '-', rest: '=', fill: '=' }
          : undefined,
    )
    const anyAccent = scores.some((row) => row.accent)
    return h(
      Graph,
      mergeProps({ title: props.title, corner: props.corner, className: props.className }, attrs),
      () =>
        h(GraphBody, rank ? { class: 'flex flex-col gap-3' } : null, () =>
          h(
            'ol',
            {
              class: score
                ? 'flex flex-col gap-2'
                : rank
                  ? 'flex w-full list-none flex-col gap-2'
                  : 'flex flex-col gap-3',
              ...(rank ? {} : { role: 'list' }),
            },
            rows.map((row, index) => {
              const rating = row as ScoreRow
              const max = Math.max(1, Math.round(rating.max ?? fallback))
              const value = Math.min(max, Math.max(0, row.value))
              const full = Math.floor(value),
                half = value - full >= 0.5
              const display = 'display' in row ? row.display : undefined
              const shown = score
                ? `${formatScore(value)}/${max}`
                : rank
                  ? display ||
                    row.value.toLocaleString('en-US', {
                      maximumFractionDigits: Number.isInteger(row.value) ? 0 : 1,
                    })
                  : // Fixed locale keeps SSR and hydration output identical (upstream uses the host locale).
                    (display ?? row.value.toLocaleString('en-US'))
              const filled = rank
                ? Math.min(ticks, Math.round((Math.max(row.value, 0) / peak) * ticks))
                : Math.max(1, Math.round((row.value / peak) * ticks))
              const track = h(GraphTrack, score ? { class: 'justify-start gap-0.5' } : null, () =>
                Array.from({ length: score ? max : ticks }, (_, cell) => {
                  const on = score ? cell < full : cell < filled
                  const partial = score && !on && half && cell === full
                  const color =
                    on || partial
                      ? score
                        ? toneClass(
                            props.palette,
                            !anyAccent || rating.accent ? 'primary' : 'secondary',
                          )
                        : rank
                          ? toneClass(props.palette, 'primary')
                          : isMonoPalette(props.palette)
                            ? 'text-graph-accent'
                            : seriesClass(props.palette, index)
                      : 'text-graph-frame'
                  return h(
                    GraphTick,
                    { key: cell, class: score ? ['flex-none', color] : color },
                    () => (on ? marks.fill : partial ? marks.rest : marks.empty),
                  )
                }),
              )
              const bracket = (text: string) =>
                h('span', { 'aria-hidden': 'true', class: 'text-graph-frame select-none' }, text)
              return withDirectives(
                h(
                  'li',
                  {
                    key: score ? `${row.label}-${index}` : row.label,
                    ...(score || rank
                      ? {
                          'aria-label': score
                            ? `${row.label} ${formatScore(value)} of ${max}`
                            : `${row.label} ${shown}`,
                        }
                      : {
                          style: seriesDim(
                            props.palette,
                            !props.stage || row.label === props.stage,
                          ),
                        }),
                    class: score
                      ? 'grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)_6ch] items-baseline gap-x-3 sm:gap-x-4'
                      : rank
                        ? 'grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_minmax(0,7rem)] items-center gap-x-2 sm:gap-x-4'
                        : 'grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_minmax(0,8ch)_minmax(0,4ch)] items-center gap-x-2 sm:gap-x-4',
                  },
                  [
                    h(
                      'span',
                      {
                        class: [
                          'truncate',
                          score && rating.accent
                            ? toneClass(props.palette, 'primary')
                            : 'text-foreground',
                        ],
                      },
                      row.label,
                    ),
                    rank
                      ? h('span', { class: 'flex min-w-0 items-center' }, [
                          bracket('['),
                          track,
                          bracket(']'),
                        ])
                      : track,
                    h(
                      'span',
                      {
                        class:
                          score || rank
                            ? 'text-right text-graph-muted tabular-nums'
                            : 'text-right text-foreground tabular-nums',
                      },
                      shown,
                    ),
                    ...(!score && !rank
                      ? [
                          h(
                            'span',
                            { class: 'text-right text-graph-muted tabular-nums' },
                            index === 0 ? '' : `${Math.round((row.value / head) * 100)}%`,
                          ),
                        ]
                      : []),
                  ],
                ),
                [[vReveal, { delay: Math.min(index, 5) * 50 }]],
              )
            }),
          ),
        ),
    )
  }
}
