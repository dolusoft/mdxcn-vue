import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import { tokensToProps } from './model.js'
import type { ComponentName } from './model.js'

export interface MarkdownWarning {
  file: string
  line: number
  component: ComponentName
  reason: string
}
export interface MarkdownOptions {
  warn?: (warning: MarkdownWarning) => void
  /** Apply the host's link renderer to retain URL rewrites and external attributes. */
  renderLinks?: boolean
}
const dataFields: Record<ComponentName, string[]> = {
  GraphStack: ['rows'],
  GraphTable: ['headers', 'rows', 'footer', 'align'],
  Endpoint: ['method', 'path', 'params', 'blocks', 'about'],
}
const escapeAttribute = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')

/** Trusted repository Markdown only: the output is executable Vue template source. */
export function mdxcnMarkdown(md: MarkdownIt, options: MarkdownOptions = {}): void {
  const parse = md.parse.bind(md)
  md.parse = (source, env = {}) => {
    const previous = env.mdxcnSource
    env.mdxcnSource = source
    try {
      return parse(source, env)
    } finally {
      env.mdxcnSource = previous
    }
  }
  md.block.ruler.before(
    'html_block',
    'mdxcn_props',
    (state, start, end, silent) => {
      if (state.sCount[start]! - state.blkIndent >= 4) return false
      const lineAt = (line: number) =>
        state.src.slice(state.bMarks[line]! + state.tShift[line]!, state.eMarks[line])
      let openingEnd = start
      let openingText = lineAt(start)
      if (!/^<(GraphStack|GraphTable|Endpoint)(?=\s|>|$)/.test(openingText)) return false
      const pattern = /^<(GraphStack|GraphTable|Endpoint)(\s(?:[^"'<>]|"[^"]*"|'[^']*')*)?>\s*$/
      let opening = openingText.match(pattern)
      while (!opening && openingEnd + 1 < end && openingEnd - start < 32) {
        openingText += '\n' + lineAt(++openingEnd)
        opening = openingText.match(pattern)
      }
      if (!opening || opening[2]?.trimEnd().endsWith('/')) return false
      const name = opening[1] as ComponentName
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
      if (close === end) return false
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
        token.meta = { mdxcn: { name, attrs, count: tokens.length, lineOffset: openingEnd + 1 } }
        for (const child of tokens) {
          if (child.map)
            child.map = child.map.map((line) => line + openingEnd + 1) as [number, number]
          state.tokens.push(child)
        }
        state.push('html_block', '', 0).content = `</${name}>\n`
        state.line = close + 1
        return true
      } catch (error) {
        const env = state.env as { path?: string; filePath?: string; relativePath?: string }
        const warning: MarkdownWarning = {
          file: env.path ?? env.filePath ?? env.relativePath ?? '<markdown>',
          line: start + 1 + sourceLineOffset(state.src, state.env),
          component: name,
          reason: error instanceof Error ? error.message : String(error),
        }
        if (options.warn) options.warn(warning)
        else
          console.warn(
            `[mdxcn-markdown] ${warning.file}:${warning.line} ${name}: ${warning.reason}; keeping runtime slot`,
          )
        return false
      }
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  )
  const convert = (state: import('markdown-it/lib/rules_core/state_core.mjs').default) => {
    for (let index = 0; index < state.tokens.length; index++) {
      const token = state.tokens[index]!
      const block = token.meta?.mdxcn as
        { name: ComponentName; attrs: string; count: number; lineOffset: number } | undefined
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
  try {
    md.core.ruler.before('anchor', 'mdxcn_props', convert)
  } catch {
    md.core.ruler.push('mdxcn_props', convert)
  }
}

function emitWarning(
  options: MarkdownOptions,
  env: { path?: string; filePath?: string; relativePath?: string; mdxcnSource?: string },
  source: string,
  start: number,
  component: ComponentName,
  reason: string,
): void {
  const warning = {
    file: env.path ?? env.filePath ?? env.relativePath ?? '<markdown>',
    line: start + 1 + sourceLineOffset(source, env),
    component,
    reason,
  }
  if (options.warn) options.warn(warning)
  else
    console.warn(
      `[mdxcn-markdown] ${warning.file}:${warning.line} ${component}: ${reason}; keeping runtime slot`,
    )
}

/** VitePress removes frontmatter before block parsing; retain original file lines. */
function sourceLineOffset(source: string, env: { mdxcnSource?: string }): number {
  const original = env.mdxcnSource
  return original?.endsWith(source)
    ? (original.slice(0, original.length - source.length).match(/\n/g)?.length ?? 0)
    : 0
}
