import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import { tokensToProps } from './model.js'
import type { ComponentName } from './model.js'
import { emitWarning, escapeAttribute, trackSource, registerFinalizer } from './diagnostics.js'
import type { WarningOptions } from './diagnostics.js'
export type { MarkdownWarning } from './diagnostics.js'

export interface MarkdownOptions extends WarningOptions {
  /** Apply the host's link renderer to retain URL rewrites and external attributes. */
  renderLinks?: boolean
}
const dataFields: Record<ComponentName, string[]> = {
  GraphBars: ['from', 'to', 'series'],
  GraphSpark: ['data', 'caption', 'written'],
  GraphPlot: ['data', 'labels', 'written'],
  GraphKpi: ['value', 'label', 'hint', 'data', 'written'],
  GraphTree: ['nodes'],
  GraphCheck: ['items'],
  GraphFlow: ['rows'],
  GraphSheet: ['headers', 'sections', 'footer', 'align'],
  GraphInvoice: ['meta', 'items', 'totals', 'note'],
  Faq: ['entries'],
  GraphBoard: ['columns'],
  GraphCompare: ['columns', 'rows', 'table'],
  GraphMatrix: ['columns', 'rows', 'table'],
  GraphHeatmap: ['columns', 'rows', 'table'],
  GraphStack: ['rows'],
  GraphTable: ['headers', 'rows', 'footer', 'align'],
  Endpoint: ['method', 'path', 'params', 'blocks', 'about'],
  Annotate: ['code', 'notes'],
  Env: ['vars'],
  Steps: ['list'],
  Changelog: ['list'],
  Decision: ['options', 'after'],
  Chat: ['turns', 'list'],
  Keys: ['bindings'],
  GraphTimeline: ['events', 'list'],
  GraphSpec: ['rows', 'list'],
  GraphScore: ['items', 'list'],
  GraphRank: ['items', 'list'],
  GraphFunnel: ['steps', 'list'],
  GraphStat: ['items', 'list'],
  GraphSlope: ['items', 'list'],
  GraphBullet: ['items', 'list'],
  GraphGantt: ['items', 'list'],
  GraphDiff: ['rows', 'footer', 'list'],
  GraphWaterfall: ['items', 'list'],
}
/** Trusted repository Markdown only: the output is executable Vue template source. */
export function mdxcnMarkdown(md: MarkdownIt, options: MarkdownOptions = {}): void {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (tokens, index, ...args) => {
    const language = tokens[index]!.info.trim().match(/^[^\s:{[]+/)?.[0]
    const html = fence(tokens, index, ...args)
    // VitePress's highlighter truncates c++ to c. Preserve the source label.
    return language && /^<div\b/.test(html)
      ? html.replace(/^<div\b/, `<div data-mdxcn-language="${escapeAttribute(language)}"`)
      : html
  }
  trackSource(md)
  md.block.ruler.before(
    'html_block',
    'mdxcn_props',
    (state, start, end, silent) => {
      if (state.sCount[start]! - state.blkIndent >= 4) return false
      const lineAt = (line: number) =>
        state.src.slice(state.bMarks[line]! + state.tShift[line]!, state.eMarks[line])
      let openingEnd = start
      let openingText = lineAt(start)
      const leading = openingText.match(
        /^<(GraphBars|GraphSpark|GraphPlot|GraphKpi|GraphTree|GraphCheck|GraphFlow|GraphSheet|GraphInvoice|Faq|GraphBoard|GraphCompare|GraphMatrix|GraphHeatmap|GraphStack|GraphTable|Endpoint|Annotate|Env|Steps|Changelog|Decision|Chat|Keys|GraphTimeline|GraphSpec|GraphScore|GraphRank|GraphFunnel|GraphStat|GraphSlope|GraphBullet|GraphGantt|GraphDiff|GraphWaterfall)(?=\s|>|$)/,
      )
      if (!leading || /\/>\s*$/.test(openingText)) return false
      const name = leading[1] as ComponentName
      const warn = (reason: string) => {
        if (!silent) emitWarning(options, state.env, state.src, start, name, reason)
      }
      const pattern =
        /^<(GraphBars|GraphSpark|GraphPlot|GraphKpi|GraphTree|GraphCheck|GraphFlow|GraphSheet|GraphInvoice|Faq|GraphBoard|GraphCompare|GraphMatrix|GraphHeatmap|GraphStack|GraphTable|Endpoint|Annotate|Env|Steps|Changelog|Decision|Chat|Keys|GraphTimeline|GraphSpec|GraphScore|GraphRank|GraphFunnel|GraphStat|GraphSlope|GraphBullet|GraphGantt|GraphDiff|GraphWaterfall)(\s(?:[^"'<>]|"[^"]*"|'[^']*')*)?>\s*$/
      const inlineOpening = openingText.match(
        /^<(GraphBars|GraphSpark|GraphPlot|GraphKpi|GraphTree|GraphCheck|GraphFlow|GraphSheet|GraphInvoice|Faq|GraphBoard|GraphCompare|GraphMatrix|GraphHeatmap|GraphStack|GraphTable|Endpoint|Annotate|Env|Steps|Changelog|Decision|Chat|Keys|GraphTimeline|GraphSpec|GraphScore|GraphRank|GraphFunnel|GraphStat|GraphSlope|GraphBullet|GraphGantt|GraphDiff|GraphWaterfall)(\s(?:[^"'<>]|"[^"]*"|'[^']*')*)?>(.*)$/,
      )
      if (inlineOpening?.[3]?.trim()) {
        warn('Opening tag and content must be on separate lines')
        return false
      }
      let opening = openingText.match(pattern)
      while (!opening && openingEnd + 1 < end && openingEnd - start < 32) {
        openingText += '\n' + lineAt(++openingEnd)
        opening = openingText.match(pattern)
      }
      if (!opening) {
        warn('Opening tag must end on its own line')
        return false
      }
      if (opening[2]?.trimEnd().endsWith('/')) return false
      let close = openingEnd + 1
      let fence: { mark: string; length: number } | undefined
      for (; close < end; close++) {
        const line = lineAt(close)
        const marker = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/)
        if (marker) {
          if (!fence) fence = { mark: marker[1]![0]!, length: marker[1]!.length }
          else if (
            marker[1]![0] === fence.mark &&
            marker[1]!.length >= fence.length &&
            !marker[2]!.trim()
          )
            fence = undefined
          continue
        }
        if (!fence && line.trim() === `</${name}>`) break
      }
      if (close === end) {
        warn('Closing component tag was not found')
        return false
      }
      if (
        /^\s*[-+*]\s/.test(lineAt(openingEnd + 1)) ||
        ([
          'GraphBars',
          'GraphSpark',
          'GraphPlot',
          'GraphKpi',
          'GraphTree',
          'GraphCheck',
          'GraphFlow',
          'Steps',
          'Changelog',
          'Decision',
          'Chat',
          'Keys',
          'GraphTimeline',
          'GraphSpec',
          'GraphScore',
          'GraphRank',
          'GraphFunnel',
          'GraphStat',
          'GraphSlope',
          'GraphBullet',
          'GraphGantt',
          'GraphDiff',
          'GraphWaterfall',
        ].includes(name) &&
          /^\s*\d+[.)]\s/.test(lineAt(openingEnd + 1)))
      ) {
        warn('A blank line is required before a Markdown list inside a component')
        return false
      }
      if (silent) return true
      const body = state.getLines(openingEnd + 1, close, state.blkIndent, false)
      const attrs = opening[2] ?? ''
      try {
        if (/\{\{|\bv-(?:if|else|for|slot|pre|html|text|bind)\b/.test(body + attrs))
          throw new Error('Dynamic Vue content')
        if (
          dataFields[name].some((field) =>
            new RegExp(`(?:^|\\s)(?::|v-bind:)?${field}(?=\\s|=|$)`).test(attrs),
          )
        )
          throw new Error('Explicit data props require runtime field precedence')
        const tokens: Token[] = []
        md.block.parse(body, md, state.env, tokens)
        const token = state.push('html_block', '', 0)
        token.content = `${openingText}\n`
        token.map = [start, close + 1]
        token.meta = { mdxcn: { name, attrs } }
        for (const child of tokens) {
          if (child.map)
            child.map = child.map.map((line) => line + openingEnd + 1) as [number, number]
          state.tokens.push(child)
        }
        state.push('html_block', '', 0).content = `</${name}>\n`
        state.line = close + 1
        return true
      } catch (error) {
        warn(error instanceof Error ? error.message : String(error))
        return false
      }
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  )
  const convert = (state: import('markdown-it/lib/rules_core/state_core.mjs').default) => {
    for (let index = 0; index < state.tokens.length; index++) {
      const token = state.tokens[index]!
      const block = token.meta?.mdxcn as { name: ComponentName; attrs: string } | undefined
      if (!block) continue
      // Find the close marker: host core rules may have inserted tokens.
      const close = state.tokens.findIndex(
        (item, at) =>
          at > index && item.type === 'html_block' && item.content === `</${block.name}>\n`,
      )
      try {
        const props = tokensToProps(
          block.name,
          state.tokens.slice(index + 1, close),
          md,
          state.env,
          {
            renderLinks: options.renderLinks,
          },
        )
        token.content = `<${block.name} v-bind="${escapeAttribute(JSON.stringify(props))}"${block.attrs} />\n`
        state.tokens.splice(index + 1, close - index)
      } catch (error) {
        emitWarning(
          options,
          state.env,
          state.src,
          token.map?.[0] ?? 0,
          block.name,
          error instanceof Error ? error.message : String(error),
        )
        index = close
      }
      delete token.meta.mdxcn
    }
  }
  // Run after host inline transformations (emoji/typographer), before anchors.
  registerFinalizer(md, 'compile', convert)
}
