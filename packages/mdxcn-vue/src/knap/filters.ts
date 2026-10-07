/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { fence } from './frame.js'
import { drawMarkdown } from './markdown.js'
import {
  asciiBars,
  asciiBoard,
  asciiBullet,
  asciiCells,
  asciiCheck,
  asciiCompare,
  asciiDiff,
  asciiFunnel,
  asciiGantt,
  asciiInvoice,
  asciiKpi,
  asciiMatrix,
  asciiMeter,
  asciiRank,
  asciiScore,
  asciiSheet,
  asciiSlope,
  asciiSpark,
  asciiSpec,
  asciiStack,
  asciiStat,
  asciiTable,
  asciiTimeline,
  asciiTree,
  asciiUptime,
  asciiWaffle,
  asciiWaterfall,
} from './graphs.js'
import {
  filterName,
  resolveGraphProps,
  warnFilter,
  type GraphFilter,
  type GraphFilterContext,
} from './props.js'
import { toComarkBlock } from './yaml.js'

type Draw = (props: never) => string

/** Content blocks draw from their Markdown `body`, like the docs MDX tab. */
function fromBody(tag: string): Draw {
  return ((props: Record<string, unknown>) => {
    const attrs: Record<string, string> = {}
    for (const [key, value] of Object.entries(props)) {
      if (key === 'body' || value == null) continue
      attrs[key] = typeof value === 'string' ? value : String(value)
    }
    const body = typeof props.body === 'string' ? props.body : ''
    return drawMarkdown(tag, attrs, body)
  }) as Draw
}

const ASCII: Record<string, Draw> = {
  callout: /* @__PURE__ */ fromBody('Callout'),
  quote: /* @__PURE__ */ fromBody('Quote'),
  steps: /* @__PURE__ */ fromBody('Steps'),
  terminal: /* @__PURE__ */ fromBody('Terminal'),
  changelog: /* @__PURE__ */ fromBody('Changelog'),
  annotate: /* @__PURE__ */ fromBody('Annotate'),
  decision: /* @__PURE__ */ fromBody('Decision'),
  chat: /* @__PURE__ */ fromBody('Chat'),
  env: /* @__PURE__ */ fromBody('Env'),
  endpoint: /* @__PURE__ */ fromBody('Endpoint'),
  keys: /* @__PURE__ */ fromBody('Keys'),
  faq: /* @__PURE__ */ fromBody('Faq'),
  'graph-board': asciiBoard as Draw,
  'graph-score': asciiScore as Draw,
  'graph-table': asciiTable as Draw,
  'graph-sheet': asciiSheet as Draw,
  'graph-bars': asciiBars as Draw,
  'graph-rank': asciiRank as Draw,
  'graph-cells': asciiCells as Draw,
  'graph-meter': asciiMeter as Draw,
  'graph-spark': asciiSpark as Draw,
  'graph-tree': asciiTree as Draw,
  'graph-timeline': asciiTimeline as Draw,
  'graph-check': asciiCheck as Draw,
  'graph-stack': asciiStack as Draw,
  'graph-funnel': asciiFunnel as Draw,
  'graph-gantt': asciiGantt as Draw,
  'graph-waffle': asciiWaffle as Draw,
  'graph-diff': asciiDiff as Draw,
  'graph-invoice': asciiInvoice as Draw,
  'graph-compare': asciiCompare as Draw,
  'graph-matrix': asciiMatrix as Draw,
  'graph-stat': asciiStat as Draw,
  'graph-kpi': asciiKpi as Draw,
  'graph-spec': asciiSpec as Draw,
  'graph-waterfall': asciiWaterfall as Draw,
  'graph-uptime': asciiUptime as Draw,
  'graph-slope': asciiSlope as Draw,
  'graph-bullet': asciiBullet as Draw,
}

export const GRAPH_FILTER_SLUGS = [
  'callout',
  'quote',
  'steps',
  'terminal',
  'changelog',
  'annotate',
  'decision',
  'chat',
  'env',
  'endpoint',
  'keys',
  'faq',
  'graph-table',
  'graph-sheet',
  'graph-invoice',
  'graph-spec',
  'graph-matrix',
  'graph-compare',
  'graph-diff',
  'graph-stat',
  'graph-kpi',
  'graph-spark',
  'graph-plot',
  'graph-bars',
  'graph-slope',
  'graph-cells',
  'graph-meter',
  'graph-waffle',
  'graph-stack',
  'graph-funnel',
  'graph-waterfall',
  'graph-rank',
  'graph-bullet',
  'graph-heatmap',
  'graph-activity',
  'graph-calendar',
  'graph-uptime',
  'graph-flow',
  'graph-tree',
  'graph-timeline',
  'graph-gantt',
  'graph-check',
  'graph-board',
  'graph-score',
  'graph-timer',
  'graph-countdown',
] as const

export type GraphFilterSlug = (typeof GRAPH_FILTER_SLUGS)[number]

function applyGraphFilter(
  slug: GraphFilterSlug,
  value: string,
  param: string | undefined,
  context?: GraphFilterContext,
) {
  try {
    const resolved = resolveGraphProps(slug, value, param, context)
    if (!resolved) {
      warnFilter(context, `Could not read ${filterName(slug)} data`, 'INVALID_FILTER_INPUT')
      return value
    }
    const ascii = ASCII[slug]
    return resolved.format === 'comark' || !ascii
      ? toComarkBlock(slug, resolved.props)
      : fence(ascii(resolved.props as never))
  } catch {
    warnFilter(context, `Could not draw ${filterName(slug)}`)
    return value
  }
}

function makeFilter(slug: GraphFilterSlug): GraphFilter {
  const name = filterName(slug)
  const filter: GraphFilter = (value, param, context) =>
    applyGraphFilter(slug, value, param, context)
  filter.metadata = {
    example: ASCII[slug] ? `${name}:"TITLE"` : `${name}:"comark"`,
  }
  return filter
}

export const graphFilters = {
  graph_callout: /* @__PURE__ */ makeFilter('callout'),
  graph_quote: /* @__PURE__ */ makeFilter('quote'),
  graph_steps: /* @__PURE__ */ makeFilter('steps'),
  graph_terminal: /* @__PURE__ */ makeFilter('terminal'),
  graph_changelog: /* @__PURE__ */ makeFilter('changelog'),
  graph_annotate: /* @__PURE__ */ makeFilter('annotate'),
  graph_decision: /* @__PURE__ */ makeFilter('decision'),
  graph_chat: /* @__PURE__ */ makeFilter('chat'),
  graph_env: /* @__PURE__ */ makeFilter('env'),
  graph_endpoint: /* @__PURE__ */ makeFilter('endpoint'),
  graph_keys: /* @__PURE__ */ makeFilter('keys'),
  graph_faq: /* @__PURE__ */ makeFilter('faq'),
  graph_table: /* @__PURE__ */ makeFilter('graph-table'),
  graph_sheet: /* @__PURE__ */ makeFilter('graph-sheet'),
  graph_invoice: /* @__PURE__ */ makeFilter('graph-invoice'),
  graph_spec: /* @__PURE__ */ makeFilter('graph-spec'),
  graph_matrix: /* @__PURE__ */ makeFilter('graph-matrix'),
  graph_compare: /* @__PURE__ */ makeFilter('graph-compare'),
  graph_diff: /* @__PURE__ */ makeFilter('graph-diff'),
  graph_stat: /* @__PURE__ */ makeFilter('graph-stat'),
  graph_kpi: /* @__PURE__ */ makeFilter('graph-kpi'),
  graph_spark: /* @__PURE__ */ makeFilter('graph-spark'),
  graph_plot: /* @__PURE__ */ makeFilter('graph-plot'),
  graph_bars: /* @__PURE__ */ makeFilter('graph-bars'),
  graph_slope: /* @__PURE__ */ makeFilter('graph-slope'),
  graph_cells: /* @__PURE__ */ makeFilter('graph-cells'),
  graph_meter: /* @__PURE__ */ makeFilter('graph-meter'),
  graph_waffle: /* @__PURE__ */ makeFilter('graph-waffle'),
  graph_stack: /* @__PURE__ */ makeFilter('graph-stack'),
  graph_funnel: /* @__PURE__ */ makeFilter('graph-funnel'),
  graph_waterfall: /* @__PURE__ */ makeFilter('graph-waterfall'),
  graph_rank: /* @__PURE__ */ makeFilter('graph-rank'),
  graph_bullet: /* @__PURE__ */ makeFilter('graph-bullet'),
  graph_heatmap: /* @__PURE__ */ makeFilter('graph-heatmap'),
  graph_activity: /* @__PURE__ */ makeFilter('graph-activity'),
  graph_calendar: /* @__PURE__ */ makeFilter('graph-calendar'),
  graph_uptime: /* @__PURE__ */ makeFilter('graph-uptime'),
  graph_flow: /* @__PURE__ */ makeFilter('graph-flow'),
  graph_tree: /* @__PURE__ */ makeFilter('graph-tree'),
  graph_timeline: /* @__PURE__ */ makeFilter('graph-timeline'),
  graph_gantt: /* @__PURE__ */ makeFilter('graph-gantt'),
  graph_check: /* @__PURE__ */ makeFilter('graph-check'),
  graph_board: /* @__PURE__ */ makeFilter('graph-board'),
  graph_score: /* @__PURE__ */ makeFilter('graph-score'),
  graph_timer: /* @__PURE__ */ makeFilter('graph-timer'),
  graph_countdown: /* @__PURE__ */ makeFilter('graph-countdown'),
} as const

export type GraphFilterName = keyof typeof graphFilters

export const graphFilterNames = /* @__PURE__ */ Object.keys(graphFilters) as GraphFilterName[]

function makeMetadata() {
  return Object.fromEntries(
    Object.entries(graphFilters).map(([name, filter]) => [
      name,
      filter.metadata ?? { example: name },
    ]),
  )
}
export const graphFilterMetadata = /* @__PURE__ */ makeMetadata()

export function createGraphFilters(names: readonly GraphFilterName[]) {
  const out: Record<string, GraphFilter> = {}
  for (const name of names) {
    const filter = graphFilters[name]
    if (filter) out[name] = filter
  }
  return out
}
