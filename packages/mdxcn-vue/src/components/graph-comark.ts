/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { Component } from 'vue'
import { fromMarkdown, GraphRow } from '../adapters/comark.js'
import { GRAPH_ADAPTERS } from '../adapters/comark-hints.js'
import type { GraphTag } from '../adapters/comark-hints.js'
import { Callout } from './callout.js'
import { Quote } from './quote.js'
import { Steps } from './steps.js'
import { Terminal } from './terminal.js'
import { Changelog } from './changelog.js'
import { Annotate } from './annotate.js'
import { Decision } from './decision.js'
import { Chat } from './chat.js'
import { Env } from './env.js'
import { Endpoint } from './endpoint.js'
import { Keys } from './keys.js'
import { Faq } from './faq.js'
import { GraphTable } from './graph-table.js'
import { GraphSheet } from './graph-sheet.js'
import { GraphInvoice } from './graph-invoice.js'
import { GraphSpec } from './graph-spec.js'
import { GraphMatrix } from './graph-matrix.js'
import { GraphCompare } from './graph-compare.js'
import { GraphDiff } from './graph-diff.js'
import { GraphStat } from './graph-stat.js'
import { GraphKpi } from './graph-kpi.js'
import { GraphSpark } from './graph-spark.js'
import { GraphPlot } from './graph-plot.js'
import { GraphBars } from './graph-bars.js'
import { GraphSlope } from './graph-slope.js'
import { GraphCells } from './graph-cells.js'
import { GraphMeter } from './graph-meter.js'
import { GraphWaffle } from './graph-waffle.js'
import { GraphStack } from './graph-stack.js'
import { GraphFunnel } from './graph-funnel.js'
import { GraphWaterfall } from './graph-waterfall.js'
import { GraphRank } from './graph-rank.js'
import { GraphBullet } from './graph-bullet.js'
import { GraphHeatmap } from './graph-heatmap.js'
import { GraphActivity } from './graph-activity.js'
import { GraphCalendar } from './graph-calendar.js'
import { GraphUptime } from './graph-uptime.js'
import { GraphFlow } from './graph-flow.js'
import { GraphTree } from './graph-tree.js'
import { GraphTimeline } from './graph-timeline.js'
import { GraphGantt } from './graph-gantt.js'
import { GraphCheck } from './graph-check.js'
import { GraphBoard } from './graph-board.js'
import { GraphScore } from './graph-score.js'
import { GraphTimer } from './graph-timer.js'
import { GraphCountdown } from './graph-countdown.js'
import { Bar, Segment } from '../adapters/stack.js'
import { Head, Row, Foot, Cell } from '../adapters/table.js'
import { Step } from './steps.js'
import { Change } from './changelog.js'
import { Event, Field } from '../adapters/timeline-spec.js'
import { Rank, Stage } from '../adapters/numeric-list.js'
import { Stat, Slope, Target } from '../adapters/stat-slope-bullet.js'
import { Span, Line, Delta } from '../adapters/gantt-diff-waterfall.js'
import { Col } from '../adapters/labeled-table.js'
import { Section, From, To, Meta, Item, Total } from '../adapters/sheet-invoice.js'
import { Node, Task, Path } from '../adapters/nested-flow.js'
import { Series } from '../adapters/series.js'
import { Grid } from '../adapters/grid-fraction.js'
const tableItems = { head: Head, row: Row, foot: Foot, cell: Cell }
const itemComponents: Partial<Record<GraphTag, Record<string, Component>>> = {
  steps: { step: Step },
  changelog: { change: Change },
  'graph-stack': { bar: Bar, segment: Segment },
  'graph-table': tableItems,
  'graph-sheet': { ...tableItems, section: Section },
  'graph-invoice': { from: From, to: To, meta: Meta, item: Item, total: Total },
  'graph-compare': { ...tableItems, col: Col },
  'graph-matrix': { ...tableItems, col: Col },
  'graph-heatmap': { ...tableItems, col: Col },
  'graph-spec': { field: Field },
  'graph-timeline': { event: Event },
  'graph-score': { rank: Rank },
  'graph-rank': { rank: Rank },
  'graph-funnel': { stage: Stage },
  'graph-stat': { stat: Stat },
  'graph-slope': { slope: Slope },
  'graph-bullet': { target: Target },
  'graph-gantt': { span: Span },
  'graph-diff': { line: Line },
  'graph-waterfall': { delta: Delta },
  'graph-tree': { node: Node },
  'graph-check': { task: Task },
  'graph-flow': { path: Path },
  'graph-bars': { series: Series },
  'graph-cells': { grid: Grid },
}

export type GraphComponentMap = Partial<Record<GraphTag, Component>>
export function createGraphComponents(installed: GraphComponentMap): Record<string, Component> {
  const row = fromMarkdown(GraphRow, GRAPH_ADAPTERS.row)
  const out: Record<string, Component> = { row }
  for (const [tag, component] of Object.entries(installed)) {
    if (!component) continue
    if (!Object.hasOwn(GRAPH_ADAPTERS, tag) || tag === 'row')
      throw new Error(`Unknown graph tag: ${tag}`)
    out[tag] = fromMarkdown(
      component,
      GRAPH_ADAPTERS[tag as GraphTag],
      itemComponents[tag as GraphTag],
      row,
    )
  }
  return out
}

export const graphComponents = /* @__PURE__ */ createGraphComponents({
  callout: Callout,
  quote: Quote,
  steps: Steps,
  terminal: Terminal,
  changelog: Changelog,
  annotate: Annotate,
  decision: Decision,
  chat: Chat,
  env: Env,
  endpoint: Endpoint,
  keys: Keys,
  faq: Faq,
  'graph-table': GraphTable,
  'graph-sheet': GraphSheet,
  'graph-invoice': GraphInvoice,
  'graph-spec': GraphSpec,
  'graph-matrix': GraphMatrix,
  'graph-compare': GraphCompare,
  'graph-diff': GraphDiff,
  'graph-stat': GraphStat,
  'graph-kpi': GraphKpi,
  'graph-spark': GraphSpark,
  'graph-plot': GraphPlot,
  'graph-bars': GraphBars,
  'graph-slope': GraphSlope,
  'graph-cells': GraphCells,
  'graph-meter': GraphMeter,
  'graph-waffle': GraphWaffle,
  'graph-stack': GraphStack,
  'graph-funnel': GraphFunnel,
  'graph-waterfall': GraphWaterfall,
  'graph-rank': GraphRank,
  'graph-bullet': GraphBullet,
  'graph-heatmap': GraphHeatmap,
  'graph-activity': GraphActivity,
  'graph-calendar': GraphCalendar,
  'graph-uptime': GraphUptime,
  'graph-flow': GraphFlow,
  'graph-tree': GraphTree,
  'graph-timeline': GraphTimeline,
  'graph-gantt': GraphGantt,
  'graph-check': GraphCheck,
  'graph-board': GraphBoard,
  'graph-score': GraphScore,
  'graph-timer': GraphTimer,
  'graph-countdown': GraphCountdown,
} satisfies GraphComponentMap)

export const graphTags = /* @__PURE__ */ Object.keys(graphComponents)
