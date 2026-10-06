/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import { emitWarning, escapeAttribute, trackSource, registerFinalizer } from './diagnostics.js'
import type { UpgradeComponent, WarningOptions } from './diagnostics.js'

export interface MdxcnOptions extends WarningOptions {
  alerts?: boolean
  quotes?: boolean
  terminals?: boolean
  footnotes?: boolean
  /** Components explicitly registered by the host; missing ones use native HTML. */
  components?: readonly UpgradeComponent[]
}
const alerts: Record<string, { type: string; title?: string }> = {
  note: { type: 'note' },
  info: { type: 'note', title: 'info' },
  abstract: { type: 'note', title: 'summary' },
  summary: { type: 'note', title: 'summary' },
  question: { type: 'note', title: 'question' },
  tip: { type: 'tip' },
  hint: { type: 'tip', title: 'hint' },
  success: { type: 'tip', title: 'success' },
  important: { type: 'warning', title: 'important' },
  warning: { type: 'warning' },
  attention: { type: 'warning', title: 'attention' },
  caution: { type: 'danger', title: 'caution' },
  danger: { type: 'danger' },
  error: { type: 'danger', title: 'error' },
  bug: { type: 'danger', title: 'bug' },
}
const alertPattern = /^\s*\[!([a-z]+)\][+-]?[ \t]*([^\n]*)\n?\s*/i
const bylinePattern = /(?:^|\n)[ \t]*(?:—|―|–|--)[ \t]*([^\n]+)$/
const prompts = ['$', '%', '❯', '>']
type Upgrade = { component: UpgradeComponent; props: Record<string, string>; available?: boolean }
function closeAt(tokens: Token[], start: number): number {
  let depth = 0
  for (let index = start; index < tokens.length; index++) {
    depth += tokens[index]!.nesting
    if (depth === 0) return index
  }
  return -1
}
function paragraphs(tokens: Token[], start: number, end: number): number[] {
  let depth = 0
  const result: number[] = []
  for (let index = start + 1; index < end; index++) {
    const token = tokens[index]!
    if (token.type === 'paragraph_open' && depth === 0 && tokens[index + 1]?.type === 'inline')
      result.push(index + 1)
    depth += token.nesting
  }
  return result
}
function plain(source: string, md: MarkdownIt, env: object): string {
  const tokens: Token[] = []
  md.inline.parse(source, md, env, tokens)
  return tokens
    .map((token) =>
      ['text', 'text_special', 'code_inline', 'image'].includes(token.type)
        ? token.content
        : ['softbreak', 'hardbreak'].includes(token.type)
          ? '\n'
          : '',
    )
    .join('')
}

/** Upgrade trusted Markdown without requiring the future prose component ports. */
export function withMdxcn(md: MarkdownIt, options: MdxcnOptions = {}): void {
  trackSource(md)
  const available = new Set(options.components ?? [])
  const nativeAlerts = new WeakMap<Token, Upgrade>()
  const warned = new Set<UpgradeComponent>()
  md.core.ruler.after('block', 'mdxcn_upgrades_blocks', (state) => {
    const tokens = state.tokens
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index]!
      if (token.type === 'fence' && options.terminals !== false) {
        const language =
          token.info
            .trim()
            .match(/^[^\s:{[]+/)?.[0]
            ?.toLowerCase() ?? ''
        const text = token.content.replace(/\n$/, '')
        const prompt = prompts
          .map((mark) => ({
            mark,
            count: text.split('\n').filter((line) => line.startsWith(`${mark} `)).length,
          }))
          .sort((a, b) => b.count - a.count)[0]!
        if (
          ['console', 'shell-session', 'terminal'].includes(language) ||
          (['sh', 'bash', 'shell', 'zsh', 'fish'].includes(language) &&
            prompt.count &&
            prompt.mark === '$')
        ) {
          token.meta = {
            ...token.meta,
            upgrade: {
              component: 'Terminal',
              props: { prompt: prompt.count ? prompt.mark : '$', text },
            } satisfies Upgrade,
          }
        }
      }
      if (token.type !== 'blockquote_open') continue
      const end = closeAt(tokens, index)
      if (end < 0) continue
      const items = paragraphs(tokens, index, end)
      const first = items[0] == null ? undefined : tokens[items[0]]
      const alert = options.alerts !== false ? first?.content.match(alertPattern) : null
      if (alert && first) {
        const kind = alert[1]!.toLowerCase()
        const known = alerts[kind]
        const title =
          plain(alert[2] ?? '', md, state.env).trim() || known?.title || (known ? '' : kind)
        const upgrade: Upgrade = {
          component: 'Callout',
          props: { type: known?.type ?? 'note', ...(title ? { title } : {}) },
        }
        if (!available.has('Callout')) {
          // Preserve host alert tokens and markers; VitePress owns their rendering.
          nativeAlerts.set(token, upgrade)
          continue
        }
        token.type = 'mdxcn_callout_open'
        token.meta = { ...token.meta, upgrade }
        tokens[end]!.type = 'mdxcn_callout_close'
        tokens[end]!.meta = { upgrade }
        first.content = first.content.slice(alert[0].length)
        if (!first.content.trim()) tokens.splice(items[0]! - 1, 3)
        continue
      }
      if (options.quotes === false) continue
      const lastIndex = items.at(-1)
      const last = lastIndex == null ? undefined : tokens[lastIndex]
      const match = last?.content.match(bylinePattern)
      if (!last || !match || match.index == null) continue
      const body = last.content.slice(0, match.index)
      if (
        !tokens
          .slice(index + 1, lastIndex)
          .some((item) =>
            (item.type === 'inline'
              ? plain(item.content, md, state.env)
              : ['fence', 'code_block'].includes(item.type)
                ? item.content
                : ''
            ).trim(),
          ) &&
        !plain(body, md, state.env).trim()
      )
        continue
      const line = plain(match[1]!, md, state.env).trim()
      const comma = line.indexOf(', ')
      const upgrade: Upgrade = {
        component: 'Quote',
        props: {
          by: comma === -1 ? line : line.slice(0, comma),
          ...(comma === -1 ? {} : { source: line.slice(comma + 2) }),
        },
      }
      token.type = 'mdxcn_quote_open'
      token.meta = { ...token.meta, upgrade }
      tokens[end]!.type = 'mdxcn_quote_close'
      tokens[end]!.meta = { upgrade }
      last.content = body.trimEnd()
      if (!last.content.trim()) tokens.splice(lastIndex! - 1, 3)
    }
  })
  const finalize = (state: import('markdown-it/lib/rules_core/state_core.mjs').default) => {
    for (const [index, token] of state.tokens.entries()) {
      if (token.type === 'footnote_block_open' && options.footnotes !== false) {
        const upgrade: Upgrade = { component: 'Footnotes', props: {} }
        token.meta = { ...token.meta, upgrade }
        const end = state.tokens.findIndex(
          (item, at) => at > index && item.type === 'footnote_block_close',
        )
        if (end >= 0) state.tokens[end]!.meta = { upgrade }
      }
      const upgrade = (token.meta?.upgrade ?? nativeAlerts.get(token)) as Upgrade | undefined
      if (!upgrade) continue
      upgrade.available = available.has(upgrade.component)
      if (!token.type.endsWith('_close') && !upgrade.available && !warned.has(upgrade.component)) {
        warned.add(upgrade.component)
        // Footnote containers lack a map; use the first mapped definition token.
        const line =
          token.map?.[0] ?? state.tokens.slice(index + 1).find((item) => item.map)?.map?.[0] ?? 0
        emitWarning(
          options,
          state.env,
          state.src,
          line,
          upgrade.component,
          'Component is not registered; using native HTML',
        )
      }
    }
  }
  registerFinalizer(md, 'upgrades', finalize)
  const binding = (upgrade: Upgrade) => `v-bind="${escapeAttribute(JSON.stringify(upgrade.props))}"`
  md.renderer.rules.mdxcn_callout_open = (tokens, index) => {
    const upgrade = tokens[index]!.meta.upgrade as Upgrade
    return upgrade.available
      ? `<Callout ${binding(upgrade)}>\n`
      : `<aside data-mdxcn="Callout" data-type="${escapeAttribute(upgrade.props.type!)}" role="note">\n<p class="mdxcn-alert-title">${md.utils.escapeHtml(upgrade.props.title ?? upgrade.props.type!)}</p>\n`
  }
  md.renderer.rules.mdxcn_callout_close = (tokens, index) =>
    (tokens[index]!.meta.upgrade as Upgrade).available ? '</Callout>\n' : '</aside>\n'
  md.renderer.rules.mdxcn_quote_open = (tokens, index) => {
    const upgrade = tokens[index]!.meta.upgrade as Upgrade
    return upgrade.available ? `<Quote ${binding(upgrade)}>\n` : '<blockquote data-mdxcn="Quote">\n'
  }
  md.renderer.rules.mdxcn_quote_close = (tokens, index) => {
    const upgrade = tokens[index]!.meta.upgrade as Upgrade
    return upgrade.available
      ? '</Quote>\n'
      : `<footer>— <cite>${md.utils.escapeHtml(upgrade.props.by!)}</cite>${upgrade.props.source ? `, ${md.utils.escapeHtml(upgrade.props.source)}` : ''}</footer>\n</blockquote>\n`
  }
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (tokens, index, ...args) => {
    const upgrade = tokens[index]!.meta?.upgrade as Upgrade | undefined
    return upgrade?.available ? `<Terminal ${binding(upgrade)} />\n` : fence(tokens, index, ...args)
  }
  for (const [name, closing] of [
    ['footnote_block_open', false],
    ['footnote_block_close', true],
  ] as const) {
    const render = md.renderer.rules[name]
    if (!render) continue
    md.renderer.rules[name] = (tokens, index, ...args) => {
      const upgrade = tokens[index]!.meta?.upgrade as Upgrade | undefined
      const html = render(tokens, index, ...args)
      return upgrade?.available
        ? closing
          ? `${html}</Footnotes>\n`
          : `<Footnotes>\n${html}`
        : html
    }
  }
}
