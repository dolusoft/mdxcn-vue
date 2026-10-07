/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
/**
 * Knap filters that turn data into framed mdxcn figures.
 *
 * Spread into createEngine. The CLI does not load these. Wire them in your app.
 *
 *   import { createEngine, standardFilters } from "knap"
 *   import { graphFilters } from "./graph-knap.js"
 *
 *   const engine = createEngine({
 *     filters: { ...standardFilters, ...graphFilters },
 *   })
 *
 * Piped value uses the upstream printable props schema.
 * Content filters (graph_callout, graph_steps, …) take a Markdown string, or
 * `{ ...props, body }` — the body uses the same grammar as MDX children.
 * A string param is the title. Pass "comark" to emit a ::graph-* block
 * instead of the fenced ASCII. Graphs with no ASCII (flow, plot, …) emit
 * Comark YAML by default.
 */

export {
  createGraphFilters,
  GRAPH_FILTER_SLUGS,
  graphFilterMetadata,
  graphFilterNames,
  graphFilters,
  type GraphFilterName,
  type GraphFilterSlug,
} from './filters.js'
export {
  CONTENT_SLUGS,
  filterName,
  GRAPH_VALUE_KEY,
  type GraphFilter,
  type GraphFilterContext,
} from './props.js'

export { resolveGraphProps, type GraphFilterWarning } from './props.js'
