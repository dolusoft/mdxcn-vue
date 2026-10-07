# Component and input inventory

Reference: [`shadcn-labs/mdxcn@16d817a`](https://github.com/shadcn-labs/mdxcn/tree/16d817a). This document records the upstream contract; no components are ported during Phase 1.

Count: 46 user components + the `graph-frame` base component (`Graph`) + the `mdx`, `graph-comark`, `graph-knap` integrations = **50 rows**. The `lib/docs/catalog.ts` catalog and the `examplesBySlug` map contain 47 entries, including the base component.

## Reading rules

- Phase 7B: The Vue ports of `Faq` and `GraphBoard` are complete. Both use
  the `sections` input; Board does not read tables, and Faq answers remain
  visible. Explicit data (including an empty array) → Markdown sections; null
  triggers fallback. There is no upstream item component. [Phase 7B report](phase-7b-report.md).

- Phase 6C: The Vue ports of `GraphGantt`, `GraphDiff`, `GraphWaterfall` and `Span`, `Line`, `Delta`
  are complete. Explicit compiler `list` input takes precedence over runtime list and item
  inputs. Gantt uses numeric fractions; it does not parse dates.
  Diff selects the `rows` and `footer` fields independently; Waterfall preserves explicit start/end
  values. Details: [Phase 6C report](phase-6c-report.md).

- Phase 6B: The Vue ports of `GraphStat`, `GraphSlope`, `GraphBullet` and `Stat`, `Slope`, `Target`
  are complete. The upstream input order is as shown in the three rows below;
  the Vue compiler's explicit `list` field suppresses runtime list and item inputs.
  Stat preserves the token and hint text; Slope uses an arrow separator, and Bullet uses a target/upper bound
  separator. Details: [Phase 6B report](phase-6b-report.md).

- Phase 2B-3 deliberate accessibility difference: Endpoint code scrolling regions carry
  `tabindex="0"`, `role="region"`, and a caption name, like the table
  region. When there is no title, the region receives an `aria-label`; no reference to a nonexistent caption ID is generated.
  Table and code regions use `:focus-visible` with `outline-offset: 3px`.

- Fields are taken from the actual source prop schema; `className` is the upstream name. Forwarding `class` on the Vue side will be decided in the Phase 2 contract.
- “Data” does not mean only the literal `data` prop; it means related props such as `rows`, `items`, and `value`. Presentation props alone do not count as data array support.
- Markdown formats are read through host elements compiled by upstream. The Vue target is `markdown-it` token → typed model at compile time, with a separate `Comark` AST adapter for runtime. Three inputs are not added to every component.
- In precedence, → indicates that the input on the right is not used if the eligible input on the left exists. The source's `??` and `== null` advance to the next input for both `undefined` and `null`. Empty arrays, empty strings, `0`, and `false` are supplied values in these checks; empty arrays do not trigger fallback. Values outside the type schema are not promised to be valid.
- The `listed.length > 0` / `tagged.length > 0` check skips an empty list/item array input. Checking for the existence of the first `Head`/`Foot` object does not skip an empty body. Selection is at the input level; there is no row-by-row merging.
- The main selection in `GraphStack` uses `rowsProp ?`: an empty array is truthy, so data still wins; `null`/`undefined` trigger fallback. `GraphInvoice.partyOf()` returns `undefined` for an empty string and does not fall back to items; a truthy object wins.
- The example ID is the `${slug}-${title}-md` React key in `components/docs/examples.tsx`; it is not a DOM `id`. Examples follow the order of `examplesBySlug[slug]` in `components/docs/examples.tsx`. The catalog ID is the same `slug` field in `lib/docs/catalog.ts`.
- Family IDs are port groups for Phase 5; they are not upstream categories. All families share a common model that preserves `link`, `strong`, `em`, and `code` information in prose.

## Source-verified table

| Component / catalog ID | Fields | Supported input formats | Actual precedence order | Docs example IDs | Grammar family |
| --- | --- | --- | --- | --- | --- |
| [`Callout`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/callout/callout.tsx#L50) / `callout` | `type`, `title`, `children`, `corner`, `className` | Data: presentation props only; Markdown: prose; item: none | Body only from `children`; title from `title ?? type` | `callout-warning-md`<br>`callout-tip with a title-md` | `prose` |
| [`Quote`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/quote/quote.tsx#L36) / `quote` | `by`, `source`, `title`, `children`, `corner`, `className` | Data: `by`, `source`; Markdown: prose; item: none | Body only from `children`; attribution only from the `by`, `source` props | `quote-attributed-md`<br>`quote-titled-md` | `prose` |
| [`Steps`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/steps/steps.tsx#L97) / `steps` | `title`, `children`, `corner`, `className` | Data array: none; Markdown: `ol` or `ul` list (examples are ordered); item: `Step` | Entire Markdown list if present → `Step`; no merging | `steps-install-md`<br>`steps-runbook-md` | `state-list` |
| [`Terminal`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/terminal/terminal.tsx#L75) / `terminal` | `title`, `prompt`, `children`, `corner`, `className` | Data array: none; Markdown: text or fence; item: none | `textOf(children)` → line parsing; `prompt` is the command marker | `terminal-install-md`<br>`terminal-comment and output-md` | `fence` |
| [`Changelog`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/changelog/changelog.tsx#L94) / `changelog` | `version`, `date`, `title`, `children`, `palette`, `corner`, `className` | Data array: none; Markdown: change list; item: `Change` | Entire Markdown list if present → `Change`; title `title ?? version` | `changelog-release-md`<br>`changelog-titled-md` | `state-list` |
| [`Annotate`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/annotate/annotate.tsx#L88) / `annotate` | `title`, `code`, `notes`, `children`, `palette`, `corner`, `className` | Data: `code`, `notes`; Markdown: fence + list; item: none | `code` → first `pre`; `notes` → `ol`/`ul` notes; the two fields are independent | `annotate-mdx-components-md`<br>`annotate-retry-md` | `fence` |
| [`Decision`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/decision/decision.tsx#L89) / `decision` | `title`, `status`, `date`, `options`, `children`, `palette`, `corner`, `className` | Data: `options`; Markdown: list + prose; item: none | `options` → Markdown list; prose outside the list is always rendered | `decision-database-md`<br>`decision-rendering-md` | `state-list` |
| [`Chat`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/chat/chat.tsx#L85) / `chat` | `title`, `you`, `prompt`, `turns`, `children`, `palette`, `corner`, `className` | Data: `turns`; Markdown: list with speakers; item: none | `turns` → Markdown list; `you` → first speaker → empty text | `chat-session-md`<br>`chat-support thread-md` | `state-list` |
| [`Env`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/env/env.tsx#L124) / `env` | `title`, `vars`, `children`, `palette`, `corner`, `className` | Data: `vars`; Markdown: fence, list, raw text; item: none | `vars` → first `pre` (even if empty) → nonempty list → raw text | `env-.env-md`<br>`env-as a list-md` | `fence` |
| [`Endpoint`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/endpoint/endpoint.tsx#L133) / `endpoint` | `title`, `method`, `path`, `params`, `blocks`, `children`, `palette`, `corner`, `className` | Data: `method`, `path`, `params`, `blocks`; Markdown: route + table + fence; item: none | `method` → first route → `GET`; `path` → first route → `/`; `params` → first table; `blocks` → fence sections; description paragraphs are also rendered | `endpoint-one component-md` | `endpoint` |
| [`Keys`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/keys/keys.tsx#L86) / `keys` | `title`, `bindings`, `children`, `palette`, `corner`, `className` | Data: `bindings`; Markdown: shortcut list; item: none | `bindings` → Markdown list | `keys-shortcuts-md` | `state-list` |
| [`Faq`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/faq/faq.tsx#L85) / `faq` | `title`, `entries`, `children`, `palette`, `corner`, `className` | Data: `entries`; Markdown: heading + answer; item: none | `entries` → prose grouped under headings | `faq-install-md` | `sections` |
| [`GraphBoard`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-board/graph-board.tsx#L94) / `graph-board` | `title`, `columns`, `children`, `palette`, `corner`, `className` | Data: `columns`; Markdown: heading + list; item: none | `columns` → Markdown sections; result is truncated to the first four columns | `graph-board-roadmap-md`<br>`graph-board-sprint-md` | `sections` |
| [`GraphScore`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-score/graph-score.tsx#L81) / `graph-score` | `title`, `items`, `max`, `children`, `glyphs`, `palette`, `corner`, `className` | Data: `items`; Markdown: score list; item: none | `items` → Markdown; row `max` → prop `max` → first populated `max` in the selected rows → `5` | `graph-score-review-md`<br>`graph-score-out of ten-md` | `numeric-list` |
| [`GraphTable`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-table/graph-table.tsx#L51) / `graph-table` | `title`, `headers`, `rows`, `footer`, `align`, `children`, `corner`, `className` | Data: `headers`, `rows`, `footer`, `align`; Markdown: table; item: `Head`, `Row`, `Foot`, `Cell` | `headers`: prop → first `Head` (even if empty) → table; `rows`: prop → nonempty `Row` array → table; `footer`: prop → first `Foot` → table; `align`: prop → `Head` cell alignments → table | `graph-table-research cost-md`<br>`graph-table-taste, explained-md` | `table` |
| [`GraphSheet`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-sheet/graph-sheet.tsx#L70) / `graph-sheet` | `title`, `headers`, `sections`, `footer`, `align`, `children`, `corner`, `className` | Data: `headers`, `sections`, `footer`, `align`; Markdown: heading + table; item: `Head`, `Section`, `Row`, `Foot`, `Cell` | `headers`: prop → first `Head` → first Markdown table; `sections`: prop → nonempty `Section` array → Markdown; section `rows`: prop → `Row` in the section; `footer`: prop → first `Foot` (Markdown footer is not used); `align`: prop → `Head` → first Markdown table | `graph-sheet-rfc-md`<br>`graph-sheet-surface-md` | `sections-table` |
| [`GraphFlow`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-flow/graph-flow.tsx#L143) / `graph-flow` | `title`, `rows`, `children`, `palette`, `corner`, `className` | Data: `rows`; Markdown: arrow-separated list, paragraph, or text; item: `Path` | `rows` → nonempty `Path` array → list → paragraph → raw text lines | `graph-flow-optimistic ui-md`<br>`graph-flow-publish path-md` | `flow` |
| [`GraphBars`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-bars/graph-bars.tsx#L116) / `graph-bars` | `title`, `from`, `to`, `children`, `processor`, `glyphs`, `palette`, `corner`, `className` | Data: `from`, `to`; Markdown: labeled number list; item: `Series` | Shared series: nonempty Markdown list → `Series`; `from`: prop → series 0 → empty series; `to`: prop → series 1 → empty series; fields are independent | `graph-bars-before / after-md`<br>`graph-bars-draft to shipped-md` | `series` |
| [`GraphRank`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-rank/graph-rank.tsx#L63) / `graph-rank` | `title`, `items`, `children`, `max`, `ticks`, `glyphs`, `palette`, `corner`, `className` | Data: `items`; Markdown: number + label list; item: `Rank` | `items` → nonempty Markdown list → `Rank` | `graph-rank-routes-md`<br>`graph-rank-coverage-md` | `numeric-list` |
| [`GraphCells`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-cells/graph-cells.tsx#L82) / `graph-cells` | `title`, `items`, `children`, `glyphs`, `palette`, `corner`, `className` | Data: `items`; Markdown: labeled cell rows; item: `Grid` | `items` → nonempty Markdown list → `Grid`; item `cells` → item body | `graph-cells-two ways to learn-md`<br>`graph-cells-coverage-md` | `grid` |
| [`GraphMeter`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-meter/graph-meter.tsx#L39) / `graph-meter` | `title`, `value`, `ticks`, `caption`, `children`, `glyphs`, `palette`, `corner`, `className` | Data: `value`, `caption`; Markdown: fraction + description; item: none | `value` → first text token; `caption` → Markdown description only when `value == null` | `graph-meter-written-md`<br>`graph-meter-shipped-md`<br>`graph-meter-coverage-md` | `fraction` |
| [`GraphSpark`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-spark/graph-spark.tsx#L41) / `graph-spark` | `title`, `data`, `caption`, `children`, `glyphs`, `palette`, `corner`, `className` | Data: `data`, `caption`; Markdown: numbers or labeled list; item: none | `data` → `seriesOf(children)`; `caption` → Markdown description only when `data == null` | `graph-spark-written-md`<br>`graph-spark-latency-md`<br>`graph-spark-requests-md` | `series` |
| [`GraphTree`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-tree/graph-tree.tsx#L123) / `graph-tree` | `title`, `nodes`, `children`, `corner`, `className` | Data: `nodes`; Markdown: nested list; item: nested `Node` | `nodes` → nonempty Markdown list → `Node`; the same selection at every nested level; item `label` → body text only at a leaf | `graph-tree-registry-md`<br>`graph-tree-team-md` | `nested-list` |
| [`GraphTimeline`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-timeline/graph-timeline.tsx#L57) / `graph-timeline` | `title`, `events`, `children`, `palette`, `corner`, `className` | Data: `events`; Markdown: dated list; item: `Event` | `events` → nonempty Markdown list → `Event` | `graph-timeline-shipped-md`<br>`graph-timeline-incident-md`<br>`graph-timeline-with notes-md` | `state-list` |
| [`GraphCheck`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-check/graph-check.tsx#L140) / `graph-check` | `title`, `items`, `children`, `palette`, `corner`, `className` | Data: `items`; Markdown: task list; item: `Task` | `items` → nonempty Markdown task list → `Task`; Markdown sublists are still parsed; item subtasks come from the `items` field | `graph-check-launch-md`<br>`graph-check-review-md`<br>`graph-check-sub-tasks-md` | `nested-list` |
| [`GraphStack`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-stack/graph-stack.tsx#L120) / `graph-stack` | `title`, `rows`, `children`, `accent`, `ticks`, `glyphs`, `palette`, `corner`, `className` | Data: `rows`; Markdown: segment list; item: `Bar`, nested `Segment` | `rows` if truthy → nonempty Markdown list → `Bar`; row `segments` → `Segment` array; segment `label` → segment body | `graph-stack-bundle-md`<br>`graph-stack-tokens-md` | `segments` |
| [`GraphFunnel`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-funnel/graph-funnel.tsx#L55) / `graph-funnel` | `title`, `steps`, `children`, `ticks`, `stage`, `glyphs`, `palette`, `corner`, `className` | Data: `steps`; Markdown: number + label list; item: `Stage` | `steps` → nonempty Markdown list → `Stage` | `graph-funnel-install-md`<br>`graph-funnel-signup-md` | `numeric-list` |
| [`GraphGantt`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-gantt/graph-gantt.tsx#L67) / `graph-gantt` | `title`, `items`, `children`, `ticks`, `columns`, `stage`, `progress`, `glyphs`, `palette`, `corner`, `className` | Data: `items`; Markdown: start/end/progress list; item: `Span` | `items` → nonempty Markdown list → `Span` | `graph-gantt-launch-md`<br>`graph-gantt-week-md` | `numeric-list` |
| [`GraphPlot`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-plot/graph-plot.tsx#L48) / `graph-plot` | `title`, `data`, `labels`, `children`, `height`, `variant`, `progress`, `glyphs`, `palette`, `corner`, `className` | Data: `data`, `labels`; Markdown: numeric text or labeled list; item: none | `data` → Markdown series; `labels` → nonempty Markdown labels (even when a data prop is supplied) | `graph-plot-labeled rows-md`<br>`graph-plot-p95-md`<br>`graph-plot-errors-md` | `series` |
| [`GraphWaffle`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-waffle/graph-waffle.tsx#L38) / `graph-waffle` | `title`, `value`, `cells`, `columns`, `caption`, `children`, `glyphs`, `palette`, `corner`, `className` | Data: `value`, `caption`; Markdown: fraction + description; item: none | `value` → first text token; `caption` → Markdown description only when `value == null` | `graph-waffle-written-md`<br>`graph-waffle-coverage-md`<br>`graph-waffle-quota-md` | `fraction` |
| [`GraphDiff`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-diff/graph-diff.tsx#L164) / `graph-diff` | `title`, `rows`, `footer`, `children`, `palette`, `corner`, `className` | Data: `rows`, `footer`; Markdown: delta list; item: `Line` | Shared rows: nonempty Markdown list → `Line`; `rows`: prop → rows other than `total`; `footer`: prop → first `total` row | `graph-diff-bundle-md`<br>`graph-diff-headcount-md`<br>`graph-diff-rename-md` | `numeric-list` |
| [`GraphInvoice`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-invoice/graph-invoice.tsx#L169) / `graph-invoice` | `title`, `from`, `to`, `meta`, `items`, `totals`, `note`, `children`, `corner`, `className` | Data: `from`, `to`, `meta`, `items`, `totals`, `note`; Markdown: list + table + paragraphs; item: `From`, `To`, `Meta`, `Item`, `Total` | `from`/`to`: prop → first corresponding item; `meta`: prop → item → list; `items`: prop → item → table; `totals`: prop → item → paragraphs with monetary amounts; `note`: prop → first paragraph without a monetary amount | `graph-invoice-studio invoice-md`<br>`graph-invoice-quote-md` | `invoice` |
| [`GraphCompare`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-compare/graph-compare.tsx#L89) / `graph-compare` | `title`, `columns`, `rows`, `children`, `accent`, `palette`, `corner`, `className` | Data: `columns`, `rows`; Markdown: labeled table; item: `Col`, `Row` | `columns`: prop → nonempty `Col` array → table; `rows`: prop → nonempty `Row` array → table | `graph-compare-plans-md`<br>`graph-compare-before after-md` | `table` |
| [`GraphMatrix`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-matrix/graph-matrix.tsx#L72) / `graph-matrix` | `title`, `columns`, `rows`, `children`, `accent`, `palette`, `corner`, `className` | Data: `columns`, `rows`; Markdown: labeled table; item: `Row` | `columns`: prop → table (no column item); `rows`: prop → nonempty `Row` array → table | `graph-matrix-detect-md`<br>`graph-matrix-latency-md` | `table` |
| [`GraphStat`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-stat/graph-stat.tsx#L51) / `graph-stat` | `title`, `items`, `children`, `corner`, `className` | Data: `items`; Markdown: number + label + hint list; item: `Stat` | `items` → nonempty Markdown list → `Stat` | `graph-stat-this week-md`<br>`graph-stat-latency-md` | `numeric-list` |
| [`GraphKpi`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-kpi/graph-kpi.tsx#L49) / `graph-kpi` | `title`, `value`, `label`, `hint`, `data`, `children`, `glyphs`, `palette`, `corner`, `className` | Data: `value`, `label`, `hint`, `data`; Markdown: summary row + numbers; item: none | Each field is independent: `value` → first token; `label` → first line label; `hint` → first line description; `data` → remaining lines | `graph-kpi-written-md`<br>`graph-kpi-reads-md`<br>`graph-kpi-latency-md` | `series` |
| [`GraphSpec`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-spec/graph-spec.tsx#L51) / `graph-spec` | `title`, `rows`, `children`, `corner`, `className` | Data: `rows`; Markdown: field/value list + notes; item: `Field` | `rows` → nonempty Markdown list → `Field`; item `value` → body text | `graph-spec-type-md`<br>`graph-spec-ship to-md`<br>`graph-spec-inline code and notes-md` | `state-list` |
| [`GraphActivity`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-activity/graph-activity.tsx#L198) / `graph-activity` | `title`, `days`, `children`, `weekStartsOn`, `max`, `legend`, `caption`, `glyphs`, `palette`, `corner`, `className` | Data: `days`; Markdown: dated number list or text lines; item: none | `days` → nonempty list → raw text lines | `graph-activity-written-md`<br>`graph-activity-year-md`<br>`graph-activity-quarter-md` | `dated-runs` |
| [`GraphHeatmap`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-heatmap/graph-heatmap.tsx#L80) / `graph-heatmap` | `title`, `columns`, `rows`, `children`, `max`, `legend`, `caption`, `glyphs`, `palette`, `corner`, `className` | Data: `columns`, `rows`; Markdown: labeled table; item: `Row` | `columns`: prop → table; `rows`: prop → nonempty `Row` array → table | `graph-heatmap-punchcard-md`<br>`graph-heatmap-coverage-md` | `table` |
| [`GraphCalendar`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-calendar/graph-calendar.tsx#L111) / `graph-calendar` | `title`, `year`, `month`, `weekStartsOn`, `marks`, `today`, `children`, `palette`, `corner`, `className` | Data: `year`, `month`, `marks`, `today`; Markdown: day list; item: none | `year`/`month` only from props; `marks`: numbers if a string, otherwise prop → nonempty list; `today`: prop → first accented day in the list (even when the `marks` prop is supplied) | `graph-calendar-with notes-md`<br>`graph-calendar-marked days-md`<br>`graph-calendar-sunday start-md` | `calendar` |
| [`GraphWaterfall`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-waterfall/graph-waterfall.tsx#L100) / `graph-waterfall` | `title`, `items`, `children`, `ticks`, `glyphs`, `palette`, `corner`, `className` | Data: `items`; Markdown: delta list; item: `Delta` | `items` → nonempty Markdown list → `Delta` | `graph-waterfall-margin-md`<br>`graph-waterfall-headcount-md` | `numeric-list` |
| [`GraphUptime`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-uptime/graph-uptime.tsx#L59) / `graph-uptime` | `title`, `days`, `from`, `to`, `columns`, `children`, `glyphs`, `palette`, `corner`, `className` | Data: `days`; Markdown: status sequence and repetitions; item: none | `days` → `sourceText(children)`; invalid statuses are discarded; `from`/`to` are presentation props only | `graph-uptime-ninety days-md`<br>`graph-uptime-incident window-md` | `status-runs` |
| [`GraphSlope`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-slope/graph-slope.tsx#L55) / `graph-slope` | `title`, `fromLabel`, `toLabel`, `items`, `children`, `palette`, `corner`, `className` | Data: `items`; Markdown: before/after arrow list; item: `Slope` | `items` → nonempty Markdown list → `Slope`; `fromLabel`/`toLabel` only from props | `graph-slope-traffic-md`<br>`graph-slope-latency-md` | `numeric-list` |
| [`GraphBullet`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-bullet/graph-bullet.tsx#L80) / `graph-bullet` | `title`, `items`, `children`, `ticks`, `glyphs`, `palette`, `corner`, `className` | Data: `items`; Markdown: value/target/upper bound list; item: `Target` | `items` → nonempty Markdown list → `Target` | `graph-bullet-targets-md`<br>`graph-bullet-capacity-md` | `numeric-list` |
| [`GraphTimer`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-timer/graph-timer.tsx#L40) / `graph-timer` | `title`, `kind`, `at`, `caption`, `children`, `palette`, `corner`, `className` | Data: `at`, `caption`; Markdown: time + description; item: none | `at` → Markdown time label; `caption` → Markdown description (even when a time prop is supplied); `at` is not used for `kind=clock` | `graph-timer-incident-md`<br>`graph-timer-last deploy-md`<br>`graph-timer-local-md` | `instant` |
| [`GraphCountdown`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-countdown/graph-countdown.tsx#L37) / `graph-countdown` | `title`, `to`, `done`, `caption`, `children`, `palette`, `corner`, `className` | Data: `to`, `caption`; Markdown: time + description; item: none | `to` → Markdown time label; `caption` → Markdown description (even when a time prop is supplied); `done` only from props | `graph-countdown-written-md`<br>`graph-countdown-freeze-md`<br>`graph-countdown-closed-md` | `instant` |
| [`Graph`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-frame/graph-frame.tsx#L202) / `graph-frame` | `title`, `corner`, `className`, `children`, `...figure` | Data: presentation props and `figure` attributes; Markdown: direct body; item: no data adapter | If `title` is truthy, `GraphTitle`; `children` is rendered directly; `corner` defaults to `+` | `graph-frame-titled frame-md`<br>`graph-frame-untitled-md` | `frame` |
| [`withMdxcn`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/mdx/mdx.tsx) / `mdx` | `components`, `options.alerts`, `options.quotes`, `options.terminals`, `options.footnotes` | Data: component map and options; Markdown: alert, quote byline, shell fence, footnote; item: none | Host markup → alert for blockquote → quote → original blockquote; eligible shell fence → Terminal → original pre; footnote section → Footnotes → original section; options are independent, default true | Catalog navigation ID `/docs/mdx`; `examplesBySlug` has no entry; examples in `app/docs/mdx/page.tsx` | `mdx-upgrade` |
| [`createGraphComponents`, `graphComponents`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-comark/graph-comark.tsx) / `graph-comark` | `installed`, `raw` props; `numeric`, `required` adapter fields; layout `cols`, `children` | Data: YAML props; Markdown: `::tag` body; item: the component's own adapter | `coerceProps` → component if a body exists or all `required` fields are populated; otherwise PendingGraph; field precedence belongs to the component above | Catalog navigation ID `/docs/comark`; `examplesBySlug` has no entry; `app/docs/comark/page.tsx`, `app/comark/page.tsx` | `runtime-adapter` |
| [`graphFilters`, `createGraphFilters`](https://github.com/shadcn-labs/mdxcn/blob/16d817a/registry/default/graph-knap/filters.ts) / `graph-knap` | `value`, `param`, `context`; resolved `props`, `format`, `body` in content | Data: object/string filter input; Markdown: content `body`; item: none; output is fenced ASCII or Comark YAML | `resolveGraphProps` → Comark if `format=comark` or there is no ASCII renderer; otherwise ASCII; warning + original value for unreadable/unrenderable input | Catalog navigation ID `/docs/knap`; `examplesBySlug` has no entry; `app/docs/knap/page.tsx`, `app/knap/page.tsx` | `ascii-adapter` |

## Data and item fields

The props in the table above do not describe the inner record schema on their own. The following fields are defined in the corresponding source; `children` is the item body, and `defineItem` adds this field to all item schemas. The shared `Head`, `Row`, `Foot`, `Cell` components are in the `graph-frame` source. `SpecLine` inherits the fields of `SpecRow`; `DiffLineProps` inherits the fields of `DiffRow`. Records such as `Painted`, `FlatRow`, and `ActivityCell` are internal rendering models, not external props.

| Component group | Inner record / item fields |
| --- | --- |
| `Steps` | `StepProps`: `title`, `state`, `children` |
| `Changelog` | `ChangeProps`: `type`, `children` |
| `Decision` | `DecisionOption`: `label`, `reason`, `state` |
| `Chat` | `ChatTurn`: `by`, `children`, `aside` |
| `Env` | `EnvVar`: `name`, `value`, `note`, `required` |
| `Endpoint` | `EndpointParam`: `name`, `type`, `description`, `required`; `EndpointBlock`: `label`, `code` |
| `Keys` | `KeyBinding`: `keys`, `action`, `accent` |
| `Faq` | `FaqEntry`: `question`, `answer`, `accent` |
| `GraphBoard` | `BoardItem`: `label`, `note`, `state`; `BoardColumn`: `title`, `items` |
| `GraphScore` | `ScoreRow`: `label`, `value`, `max`, `accent` |
| `GraphSheet` | `SheetSection`: `title`, `rows`; `SectionProps`: `title`, `rows` |
| `GraphFlow` | `FlowNode`: `label`, `tone`, `stretch`; `FlowRow`: `nodes`; `PathProps`: `children` |
| `GraphBars` | `BarSeries`: `label`, `values`, `size`; `SeriesProps`: `label`, `values`, `size` |
| `GraphRank` | `RankItem`: `label`, `value`, `display` |
| `GraphCells` | `CellGrid`: `label`, `cells`; `GridProps`: `label`, `cells` |
| `GraphTree` | `TreeNode`: `label`, `meta`, `accent`, `children`; `NodeProps`: `label`, `meta`, `accent`, `children`; `FlatRow`: `key`, `branch`, `label`, `meta`, `accent` |
| `GraphTimeline` | `TimelineEvent`: `date`, `label`, `state`, `note` |
| `GraphCheck` | `CheckItem`: `label`, `done`, `note`, `items` |
| `GraphStack` | `StackSegment`: `label`, `value`; `StackRow`: `label`, `segments`, `children`; `Painted`: `label`, `glyph`, `count`, `accent` |
| `GraphFunnel` | `FunnelStep`: `label`, `value`, `display` |
| `GraphGantt` | `GanttItem`: `label`, `start`, `end`, `accent`, `complete`; `GanttRow`: `label`, `start`, `end`, `accent`, `complete` |
| `GraphDiff` | `DiffRow`: `label`, `value`, `sign`; `DiffLineProps`: `total` |
| `GraphInvoice` | `InvoiceParty`: `name`, `lines`; `InvoiceMeta`: `label`, `value`; `InvoiceItem`: `description`, `qty`, `rate`, `amount`; `InvoiceTotal`: `label`, `value`, `accent` |
| `GraphCompare` | `CompareRow`: `label`, `values` |
| `GraphMatrix` | `MatrixRow`: `label`, `values` |
| `GraphStat` | `StatItem`: `value`, `label`, `hint`, `accent` |
| `GraphSpec` | `SpecRow`: `label`, `value`, `accent`, `note`; `SpecLine`: `rich` |
| `GraphActivity` | `ActivityDay`: `date`, `count`; `ActivityCell`: `date`, `count`, `inRange` |
| `GraphHeatmap` | `HeatRow`: `label`, `values` |
| `GraphCalendar` | `CalendarMark`: `day`, `accent`, `label` |
| `GraphWaterfall` | `WaterfallItem`: `label`, `value`, `display`, `kind`; `WaterfallRow`: `label`, `value`, `display`, `kind` |
| `GraphSlope` | `SlopeItem`: `label`, `from`, `to` |
| `GraphBullet` | `BulletItem`: `label`, `value`, `target`, `max`, `display`; `BulletRow`: `label`, `value`, `target`, `max`, `display` |
| `Graph` | `CellProps`: `align`; `RowProps`: `label`, `cells` |
| Shared table item components | `Head`: `children`; `Row`/`Foot`: `label`, `cells`, `children`; `Cell`: `children`, `align` |
| `GraphStack` inner segment | `Segment`: `label`, `value`, `children`; `Bar`: `label`, `segments`, `children` |
| `GraphInvoice` item components | `From`/`To`: `name`, `lines`, `children`; `Meta`: `label`, `value`, `children`; `Item`: `description`, `qty`, `rate`, `amount`, `children`; `Total`: `label`, `value`, `accent`, `children` |

Table cell `cellsOf` precedence: array prop (even if empty) → nonempty `Cell` array → string prop or body text. `GraphCompare`, `GraphMatrix`, and `GraphHeatmap` rows do not use `cellsOf`; they read text using their own boolean/number grammar rules. The `GraphStack` item body is not parsed as segment text; the text grammar applies only to the Markdown list path.

## Phase 5 grouping

- `prose`, `fence`, `endpoint`, `mdx-upgrade`: rich body, code whitespace, markers, and host transformation.
- `state-list`, `numeric-list`: `listItems`, `itemParts`, `splitLabel`, `firstToken`, accent, and state. Number grammar rules are component-specific; a single regex does not replace all of them.
- `nested-list`, `flow`: nested trees/tasks and arrow-separated nodes; item order and recursion.
- `table`, `sections-table`, `invoice`, `sections`: tables, `headingSections`, and per-field fallback; shared cell/prose model, different precedence rules.
- `series`, `fraction`, `segments`, `grid`: number/repetition sequences, fractions, segments, and cell matrices.
- `dated-runs`, `status-runs`, `calendar`, `instant`: UTC date sequences, status repetitions, month/day calculations, and the clock after mount.
- `frame`: shared semantic frame, theme, and animation; `runtime-adapter` and `ascii-adapter`: separate input/output boundaries of the same model.

## Per-field acceptance fixture contract

In Phase 2 and Phase 5 tests, each data field will be tested with independent expected results for prop only, Markdown only, supported item only, simultaneous inputs, `undefined`, `null`, empty array, and empty text cases. In particular:

- `GraphStack`: data wins when all three inputs are supplied together; an empty data array suppresses all rows; when data is absent, the list suppresses item rows.
- `GraphTable`/`GraphHeatmap`: when data is absent, item rows suppress Markdown rows; columns are selected separately.
- `GraphBars`: when only the `from` prop is supplied, `to` comes from the second element of the Markdown/item series; it is not filled again from the first series.
- `GraphInvoice`: `meta`, `items`, and `totals` are independent of one another; an empty array suppresses only its own field's fallback input. An empty party string does not fall back to items.
- `GraphMeter`/`GraphWaffle`/`GraphSpark`: when a data prop is supplied, the automatic Markdown caption is not used. This condition does not apply to the auxiliary fields of `GraphPlot`, `GraphCalendar`, `GraphTimer`, and `GraphCountdown`.
- `GraphScore`: the general fallback comes from the result of `rows.find(row => row.max)`, not from the first row; the row's own `max` value takes precedence over the general prop.
- `graph-comark`: `isPresent` treats an empty array and an empty/whitespace-only string as missing; this differs from the direct component's `??` contract.

## Deliberate differences from upstream

These are approved target contracts; there is no component implementation yet in Phase 1.

1. `GraphStack.segmentsFromText` will replace the current `([\d,.]+)\s+(\S+)` match with `(\d[\d,.]*)\s+([^\s,]+)`. For `48 js, 22 css, 30 images`, the labels are `js`, `css`, `images`; the values are `48`, `22`, `30`. For `1,200 js`, `1200`/`js`. This correction is not a complete grammar decision; negative numbers, multiword labels, and local number formats will be decided separately.
2. The contrast target for `--graph-muted` in normal text is at least 4.5:1; upstream token/opacity values will change as needed. The visual difference will be explicitly recorded as a contrast requirement.
3. Accessibility: `figure`/title relationship, meaningful table/list semantics, `aria-hidden` for decorative glyphs, screen reader summaries, keyboard interaction, and reduced-motion control. SSR content will arrive visible; it will not be hidden before an observer is set up; preference changes and unmount will clean up animations.
4. Missing `graph-scroll-x`, `scrollbar-graph`, and `graph-title-ink` utility definitions will be completed in the registry distribution. No implicit dependency on the application's existing CSS will remain.
5. Accent: graph styles, host theme connections (including `--destructive`), and optional full themes/presets will be separate entries. A preset will work on a container; global application only on `html` will not be required. 14 presets will not count as base component dependencies.
6. Vue `v-reveal` + WAAPI will be used instead of React `motion`; `0.4` opacity and glyph delays will be preserved. The Markdown compile-time adapter and runtime adapter will be kept separate; framework internal API calls will not be ported.
7. The `GraphTable` horizontal scrolling container carries `tabindex="0"`, `role="region"`, and `aria-labelledby`. Both this region and `<table>` are named by the same `figcaption` ID; keyboard access is a deliberate improvement over upstream.

## Phase 2B-2 implementation status

`Endpoint` and `GraphTimer` were implemented for Vue 3 based on the pinned sources in the table above.
`Endpoint` selects each field independently; it reads the first direct host table using its own parameter
rules. The shared `rowsIn`/`hostCells` VNode readers are reused;
`GraphTable` total row detection is not applied to parameters. Description paragraphs,
code/link content in parameters, and request/response whitespace are preserved. The `div` container of VitePress
fence output is not part of upstream's direct `pre` contract;
the docs example uses `pre > code` or `blocks`. The Markdown compiler is out of scope.

`GraphTimer` and `useGraphNow` use a `null` clock during the first render, like upstream;
SSR and the first client render produce the same placeholder value. A per-second
interval starts after mount and is cleared during unmount. The interval continues in a hidden tab;
upstream behavior is preserved. `TZ=UTC` and the fake clock are fixed in clock tests.

## License and copyright

[Upstream LICENSE](https://github.com/shadcn-labs/mdxcn/blob/16d817a/LICENSE) is MIT; the original line is `Copyright (c) 2026 Keshav Bagaade`. The `LICENSE` files in the repo and the two publishable packages contain this notice, the permission text, and the Dolusoft port notice. The `files` field in `package.json` includes the license in the npm package. The notice and permission text must also be distributed when registry sources are generated.

The Svelte port is only a read-only design reference; no Svelte code was taken in this phase. If code is taken in a later phase, the `Copyright (c) 2026 Shriji` notice in the source [`mdxcn-svelte` LICENSE](https://github.com/peopledrivemecrazy/mdxcn-svelte/blob/e99a13a/LICENSE) must also be preserved; the Keshav/Dolusoft notice alone must not be considered sufficient.

## Toolchain and DevTools verification

Verification time obtained from the system: 2026-10-06 Tuesday 21:17 (Europe/Istanbul). Each row is the output of `npm view <paket> version`; direct tool dependencies are pinned to exact versions. The `vue` peer range is for consumer compatibility, not the development version.

| Package | npm latest / development version used |
| --- | --- |
| `vue` | `3.5.43` |
| `vite` | `8.3.3` |
| `@vitejs/plugin-vue` | `6.0.9` |
| `vite-plugin-vue-devtools` | `8.2.1` |
| `@vitejs/devtools` | `0.7.6` |
| `tailwindcss` | `4.3.3` |
| `@tailwindcss/vite` | `4.3.3` |
| `vue-tsc` | `3.3.12` |
| `typescript` | Used `6.0.3`; npm latest `7.0.2`; `typescript-eslint` peer ceiling `<6.1.0` |

The only prerelease exception is the exact version `vitepress@2.0.0-alpha.20`. The Vite override in the workspace uses the same latest version.

Both DevTools are enabled in the `apps/docs` application; no additional playground is needed. Vite DevTools is enabled through the top-level `devtools: { apply: 'serve', clientAuth: false }` setting in `apps/docs/vite.config.ts`; Vue DevTools is enabled through the `vueDevTools()` plugin in `apps/docs/.vitepress/config.ts`. Because VitePress forwards the Vite configuration through the plugin `config` hook, the `devtools` setting is not placed inside this hook.

- Vue DevTools: `http://localhost:5173/__devtools__/`. The `__devtools__` middleware and URL spelling were verified in the installed `vite-plugin-vue-devtools@8.2.1` source; [official plugin guide](https://devtools.vuejs.org/guide/vite-plugin).
- Vite DevTools: `http://localhost:5173/__devtools/` (the number of trailing underscores differs). The [official guide](https://devtools.vite.dev/guide/) confirms the path and the `apply: 'serve'` setting; the installed package's `createDevToolsHub` documentation gives the same mount path.
- The default VitePress dev port is 5173; if the port is busy, use the port reported by the server. No dev server is started in this phase.
- The VitePress dev HTML flow calls `server.transformIndexHtml`; therefore, the DevTools HTML injection path exists. Config resolution verifies both plugins without starting a server; UI, connection, and browser measurement belong to a separate live verification.
- `apps/docs/test/config.test.mjs` contains two real checks: Vue DevTools, Vite DevTools injection/server, and Tailwind in the development configuration; absence of both DevTools plugins in the production configuration. The previous `echo` test placeholder has been removed.

## Phase 7A implementation note

`GraphCompare`, `GraphMatrix`, and `GraphHeatmap` are complete. Data fields are selected independently; empty arrays suppress fallback input, and null triggers fallback. The compiler `table` field carries a shared `TableModel`; item rows take precedence over it. `Col` provides only Compare columns. The shared table reader has not changed. Using native `table`, `th scope`, and a focusable scrolling region named by a caption instead of the upstream grid/list is a deliberate accessibility difference. Heatmap glyphs remain decorative; actual numbers are preserved as `sr-only` text in each cell. Matrix/Heatmap text parsing skips empty cells like upstream.

## Phase 7C implementation note

`GraphSheet` and `GraphInvoice` are complete; the field precedence rules above have been preserved. The shared `headingSections`, `tableOf`, `cellsOf`, `alignsOf`, and `resolveTable` readers have not changed. The existing table reading in the Markdown compiler was moved to the `readTable` function and used in three components. Sheet does not take data from tables without headings; if the first section is empty, a later table does not provide headers/align fallback. `Total` or a bold final row is separated as a footer by the shared reader; Sheet and Invoice do not use this Markdown footer value. The Sheet footer comes only from prop/`Foot` input. Invoice totals are `Total` items or paragraphs with monetary amounts; there is no subtotal/tax calculation, `Intl`, or locale conversion. Amounts remain literal strings.

The two new tables preserve the upstream native DOM/a11y structure; the GraphTable accessibility additions were not copied. The `graph-sheet-table` and `graph-invoice-table` classes only remove the host CSS effect. Sheet padding values are applied directly to the body container with the upstream merged classes. The `vReveal` row/total delay increases by 40 ms, capped at 240 ms. Detailed evidence is in `docs/phase-7c-report.md`.

## Phase 10B integration decision

`graph-knap` is complete: framework-independent TS filters, the `mdxcn-vue/knap`
entry, and registry sources produce the same output. There are independent upstream
fixtures for 46 filters; 39 ASCII renderers and seven default Comark paths are covered.
This print schema is separate from runtime Vue/compiler models; the existing repo
previously had no ASCII renderer. Nested YAML objects/string values and the error fallback
boundary were corrected against upstream bugs.

The `mdx` registry item distributes four Vue components (`Footnotes`, `Callout`, `Quote`,
`Terminal`). Markdown transformation remains in the existing `mdxcn-markdown/withMdxcn`
function; no second compiler or React component-map API is added.
`Footnotes` preserves host heading/note IDs and backlink VNode content.
Details are in the [Phase 10B report](phase-10b-report.md).
