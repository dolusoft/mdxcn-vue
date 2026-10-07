import type MarkdownIt from 'markdown-it'
import type { SheetModel, InvoiceData } from 'mdxcn-vue/core'
import { resolveSheet, invoiceItems, moneyLine } from 'mdxcn-vue/core'
import type { BoardColumn, FaqEntry, ProseBlock } from 'mdxcn-vue/core'
import { boardFromList, headingSections } from 'mdxcn-vue/core'
import type Token from 'markdown-it/lib/token.mjs'
import type { ProseNode, StackRow, TableModel } from 'mdxcn-vue/core'
import {
  proseText,
  sliceProse,
  splitLabel,
  segmentsFromText,
  normalizeProseWhitespace,
} from 'mdxcn-vue/core'
import type { EndpointBlock, EndpointParam } from 'mdxcn-vue'
import type { EnvVar } from 'mdxcn-vue/core'
import { parseEnv, envVarFromList } from 'mdxcn-vue/core'
import { optionFromList } from 'mdxcn-vue/core'
import type { StateListItem, DecisionOption } from 'mdxcn-vue/core'
import { bindingFromList } from 'mdxcn-vue/core'
import type { ChatListItem, KeyBinding } from 'mdxcn-vue/core'

export type ComponentName =
  | 'GraphSheet'
  | 'GraphInvoice'
  | 'Faq'
  | 'GraphBoard'
  | 'GraphCompare'
  | 'GraphMatrix'
  | 'GraphHeatmap'
  | 'GraphStack'
  | 'GraphTable'
  | 'Endpoint'
  | 'Annotate'
  | 'Env'
  | 'Steps'
  | 'Changelog'
  | 'Decision'
  | 'Chat'
  | 'Keys'
  | 'GraphTimeline'
  | 'GraphSpec'
  | 'GraphScore'
  | 'GraphRank'
  | 'GraphFunnel'
  | 'GraphStat'
  | 'GraphSlope'
  | 'GraphBullet'
  | 'GraphGantt'
  | 'GraphDiff'
  | 'GraphWaterfall'
export type CompiledProps =
  | SheetModel
  | InvoiceData
  | { entries: FaqEntry[] }
  | { columns: BoardColumn[] }
  | { table: TableModel }
  | { rows: StackRow[] }
  | TableModel
  | { code: string; notes: ProseNode[][]; title: string }
  | { vars: EnvVar[] }
  | { list: StateListItem[] }
  | { list: ChatListItem[] }
  | { bindings: KeyBinding[] }
  | { options: DecisionOption[]; after: ProseNode[][] }
  | {
      method: string
      path: string
      params: EndpointParam[]
      blocks: EndpointBlock[]
      about: ProseNode[][]
    }

interface Block {
  tag: string
  token: Token
  children: Block[]
  prose?: ProseNode[]
}
const allowed = new Set(['ul', 'li', 'p', 'table', 'thead', 'tbody', 'tr', 'th', 'td'])

function inline(
  tokens: Token[],
  md: MarkdownIt,
  env: object,
  renderLinks: boolean,
  line?: number,
  strike = false,
): ProseNode[] {
  const root: ProseNode[] = []
  const stack = [root]
  for (const [index, token] of tokens.entries()) {
    const children = stack.at(-1)!
    if (token.type === 'text' && /\[[^\]]+\]/.test(token.content))
      throw new Error('Unresolved reference links require runtime resolution')
    if (['text', 'text_special', 'emoji', 'softbreak'].includes(token.type)) {
      let value = token.type === 'softbreak' ? '\n' : token.content
      if (token.type === 'text') {
        // Read rendered text semantics once: VitePress restores entities for Vue,
        // whereas plain markdown-it already decoded them. Avoid double decoding.
        const rendered =
          md.renderer.rules.text?.(tokens, index, md.options, env, md.renderer) ??
          md.utils.escapeHtml(value)
        if (/[<>]/.test(rendered)) throw new Error('Custom text renderer produces markup')
        value = rendered.replace(/&(?:#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (entity) =>
          md.utils.unescapeAll(entity),
        )
      }
      children.push({ type: 'text', value })
    } else if (token.type === 'code_inline')
      children.push({ type: 'code', children: [{ type: 'text', value: token.content }] })
    else if (
      ['strong_open', 'em_open', 'link_open'].includes(token.type) ||
      (strike && token.type === 's_open')
    ) {
      if (token.type === 'link_open' && renderLinks) {
        token.meta = { ...token.meta, vpLine: line }
        md.renderer.rules.link_open?.(tokens, index, md.options, env, md.renderer)
      }
      const node: ProseNode =
        token.type === 'link_open'
          ? {
              type: 'link',
              href: token.attrGet('href') ?? '',
              ...Object.fromEntries(
                ['title', 'target', 'rel']
                  .filter((key) => token.attrGet(key) != null)
                  .map((key) => [key, token.attrGet(key)!]),
              ),
              children: [],
            }
          : {
              type:
                token.type === 'strong_open' ? 'strong' : token.type === 's_open' ? 'del' : 'em',
              children: [],
            }
      children.push(node)
      stack.push(node.children)
    } else if (
      ['strong_close', 'em_close', 'link_close'].includes(token.type) ||
      (strike && token.type === 's_close')
    )
      stack.pop()
    else throw new Error(`Unsupported inline token: ${token.type}`)
  }
  return root
}

function blocks(
  tokens: readonly Token[],
  md: MarkdownIt,
  env: object,
  options: TokenModelOptions,
  orderedLists = false,
  strike = false,
  sections = false,
): Block[] {
  const root: Block[] = []
  const stack = [root]
  for (const token of tokens) {
    if (token.type === 'inline') {
      const children: Token[] = token.children ?? []
      if (!children.length && token.content) md.inline.parse(token.content, md, env, children)
      stack.at(-1)!.push({
        tag: 'inline',
        token,
        children: [],
        prose: inline(
          children,
          md,
          env,
          options.renderLinks ?? false,
          (token.map?.[0] ?? 0) + (options.lineOffset ?? 0) + 1,
          strike,
        ),
      })
    } else if (token.type === 'fence') stack.at(-1)!.push({ tag: 'fence', token, children: [] })
    else if (
      token.nesting === 1 &&
      (allowed.has(token.tag) ||
        (orderedLists && token.tag === 'ol') ||
        (sections && /^(h[1-6]|blockquote)$/.test(token.tag)))
    ) {
      const block: Block = { tag: token.tag, token, children: [] }
      stack.at(-1)!.push(block)
      stack.push(block.children)
    } else if (
      token.nesting === -1 &&
      (allowed.has(token.tag) ||
        (orderedLists && token.tag === 'ol') ||
        (sections && /^(h[1-6]|blockquote)$/.test(token.tag)))
    )
      stack.pop()
    else throw new Error(`Unsupported block token: ${token.type}`)
  }
  return root
}
const content = (block: Block): ProseNode[] => block.prose ?? block.children.flatMap(content)
function trim(nodes: ProseNode[]): ProseNode[] {
  const text = proseText(nodes)
  return sliceProse(nodes, text.length - text.trimStart().length, text.trimEnd().length)
}
const cell = (block: Block): string | ProseNode[] => {
  const nodes = normalizeProseWhitespace(content(block))
  return nodes.some((node) => node.type !== 'text') ? nodes : proseText(nodes)
}
const bold = (nodes: ProseNode[]): boolean =>
  nodes.some((node) => node.type !== 'text' && (node.type === 'strong' || bold(node.children)))
const route = /^\s*(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|QUERY)\s+(\S+)\s*$/i

function readTable(table: Block): TableModel | null {
  const head = table.children.find((b) => b.tag === 'thead')?.children[0]
  if (!head) return null
  const rows = table.children.find((b) => b.tag === 'tbody')?.children ?? []
  const last = rows.at(-1)
  const first = last?.children[0] ? trim(content(last.children[0])) : []
  const total =
    rows.length > 1 &&
    (/^total$/i.test(proseText(first)) || (first.length === 1 && first[0]?.type === 'strong'))
  const align = head.children.map(
    (b) =>
      b.token.attrGet('style')?.match(/text-align:(left|right)/)?.[1] as
        'left' | 'right' | undefined,
  )
  return {
    headers: head.children.map((b) => proseText(normalizeProseWhitespace(content(b)))),
    rows: (total ? rows.slice(0, -1) : rows).map((row) => row.children.map(cell)),
    ...(total && last ? { footer: last.children.map(cell) } : {}),
    ...(align.some(Boolean)
      ? { align: align.map((v, i) => v ?? (i === 0 ? 'left' : 'right')) }
      : {}),
  }
}

/** Read raw block tokens before anchors, renderer wrappers, or highlighting. */
export interface TokenModelOptions {
  renderLinks?: boolean
  lineOffset?: number
}
export function tokensToProps(
  name: ComponentName,
  tokens: readonly Token[],
  md: MarkdownIt,
  env: object = {},
  options: TokenModelOptions = {},
): CompiledProps {
  if (name === 'GraphSheet' || name === 'GraphInvoice') {
    const tree = blocks(tokens, md, env, options, true, false, true)
    if (name === 'GraphSheet') {
      const sections = headingSections(tree, (b) =>
        /^h[1-6]$/.test(b.tag) ? { title: proseText(content(b)).trim(), accent: false } : undefined,
      )
      return resolveSheet(
        {},
        { sections: [] },
        sections.map((s) => {
          const table = s.children.find((b) => b.tag === 'table')
          return { title: s.title, table: table ? readTable(table) : null }
        }),
      )
    }
    const table = tree.find((b) => b.tag === 'table')
    const paragraphs = tree.filter((b) => b.tag === 'p')
    return {
      meta: tree
        .filter((b) => b.tag === 'ul' || b.tag === 'ol')
        .flatMap((b) => b.children)
        .map((b) => splitLabel(proseText(content(b))))
        .filter((e) => e.rest)
        .map((e) => ({ label: e.label, value: e.rest })),
      items: invoiceItems(table ? readTable(table) : null),
      totals: paragraphs.flatMap((p) => {
        const parsed = moneyLine(proseText(content(p)).trim())
        return parsed ? [{ ...parsed, accent: bold(content(p)) }] : []
      }),
      note: paragraphs.map((p) => proseText(content(p)).trim()).find((t) => t && !moneyLine(t)),
    }
  }
  if (name === 'Faq' || name === 'GraphBoard') {
    const tree = blocks(tokens, md, env, options, true, false, true)
    const has = (nodes: ProseNode[], type: 'strong' | 'em'): boolean =>
      nodes.some((node) => node.type !== 'text' && (node.type === type || has(node.children, type)))
    const sections = headingSections(tree, (block) =>
      /^h[1-6]$/.test(block.tag)
        ? { title: proseText(content(block)).trim(), accent: has(content(block), 'strong') }
        : undefined,
    )
    if (name === 'GraphBoard')
      return {
        columns: sections.map((section) => {
          const lists = section.children.filter((block) => block.tag === 'ul' || block.tag === 'ol')
          const items = (
            lists.length ? lists.flatMap((list) => list.children) : section.children
          ).filter((block) => block.tag === 'li')
          return {
            title: section.title,
            items: items.map((item) => {
              const visible = item.children
                .filter((block) => block.tag !== 'ul' && block.tag !== 'ol')
                .flatMap(content)
              return boardFromList(
                proseText(visible).replace(/\s+/g, ' ').trim(),
                has(content(item), 'strong'),
                has(content(item), 'em'),
              )
            }),
          }
        }),
      }
    const proseBlock = (block: Block): ProseBlock => {
      if (!['p', 'ul', 'ol', 'li', 'blockquote'].includes(block.tag))
        throw new Error(`Unsupported FAQ block: ${block.tag}`)
      const start = block.token.attrGet('start')
      return {
        tag: block.tag === 'p' && block.token.hidden ? 'inline' : (block.tag as ProseBlock['tag']),
        ...(start === null ? {} : { start: Number(start) }),
        ...(block.children.every((child) => child.tag === 'inline')
          ? { content: content(block) }
          : { children: block.children.map(proseBlock) }),
      }
    }
    return {
      entries: sections.map((section) => ({
        question: section.title,
        accent: section.accent,
        ...(section.children.length ? { answer: section.children.map(proseBlock) } : {}),
      })),
    }
  }
  if (['GraphCompare', 'GraphMatrix', 'GraphHeatmap'].includes(name)) {
    try {
      return { table: tokensToProps('GraphTable', tokens, md, env, options) as TableModel }
    } catch (error) {
      throw new Error((error as Error).message.replaceAll('GraphTable', name), { cause: error })
    }
  }
  const stateList = [
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
  ].includes(name)
  const tree = blocks(
    tokens,
    md,
    env,
    options,
    stateList || name === 'Annotate' || name === 'Env',
    name === 'GraphDiff',
  )
  if (stateList) {
    if (tree.some((block) => !['ul', 'ol', 'p'].includes(block.tag)))
      throw new Error(`${name} requires lists and paragraphs`)
    const items = tree
      .filter((block) => block.tag === 'ul' || block.tag === 'ol')
      .flatMap((list) => list.children)
    if (items.some((item) => item.children.some((block) => !['p', 'inline'].includes(block.tag))))
      throw new Error('Nested list items require runtime resolution')
    const has = (nodes: ProseNode[], type: 'strong' | 'em'): boolean =>
      nodes.some((node) => node.type !== 'text' && (node.type === type || has(node.children, type)))
    if (
      [
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
      ].includes(name)
    )
      return {
        list: items.map((item) => {
          const paragraphs = item.children
            .filter((block) => block.tag === 'p' && !block.token.hidden)
            .map((block) =>
              content(block).filter((node) => node.type !== 'text' || node.value !== ''),
            )
          const head =
            paragraphs[0] ??
            content(item).filter((node) => node.type !== 'text' || node.value !== '')
          return {
            head,
            body: paragraphs.slice(1),
            text: proseText(content(item)).replace(/\s+/g, ' ').trim(),
            paragraphs,
            strong: [
              'GraphScore',
              'GraphRank',
              'GraphFunnel',
              'GraphStat',
              'GraphSlope',
              'GraphBullet',
              'GraphGantt',
              'GraphDiff',
              'GraphWaterfall',
            ].includes(name)
              ? bold(content(item))
              : bold(head),
            em: has(head, 'em'),
          }
        }),
      }
    if (name === 'Chat')
      return {
        list: items.map((item) => {
          const paragraphs = item.children.filter(
            (block) => block.tag === 'p' && !block.token.hidden,
          )
          const clean = (block: Block) =>
            content(block).filter((node) => node.type !== 'text' || node.value !== '')
          return {
            head: paragraphs.length ? clean(paragraphs[0]!) : clean(item),
            body: paragraphs.slice(1).map(clean),
          }
        }),
      }
    const list: StateListItem[] = items.map((item) => ({
      text: proseText(content(item)).replace(/\s+/g, ' ').trim(),
      // Hidden paragraph tokens in tight lists have no host p in the rendered DOM.
      paragraphs: item.children
        .filter((block) => block.tag === 'p' && !block.token.hidden)
        .map((block) => content(block).filter((node) => node.type !== 'text' || node.value !== '')),
      strong: has(content(item), 'strong'),
      em: has(content(item), 'em'),
    }))
    if (name === 'Keys') return { bindings: list.map(bindingFromList) }
    return name === 'Decision'
      ? {
          options: list.map(optionFromList),
          after: tree.filter((block) => block.tag === 'p').map(content),
        }
      : { list }
  }
  if (name === 'Annotate' || name === 'Env') {
    if (tree.some((block) => !['fence', 'ol', 'ul', 'p'].includes(block.tag)))
      throw new Error(`${name} requires fences, lists or paragraphs`)
    const fence = tree.find((block) => block.tag === 'fence')
    const items = tree
      .filter((block) => block.tag === 'ol' || block.tag === 'ul')
      .flatMap((list) => list.children)
    // Preserve paragraph and nested-list structure through the runtime reader.
    if (
      items.some(
        (item) =>
          item.children.some((block) => !['p', 'inline'].includes(block.tag)) ||
          item.children.filter((block) => block.tag === 'p').length > 1,
      )
    )
      throw new Error('Complex list items require runtime resolution')
    if (name === 'Annotate')
      return {
        code: fence?.token.content ?? '',
        notes: items.map(content),
        title: fence?.token.info.trim().match(/^[^\s:{[]+/)?.[0] ?? 'code',
      }
    return {
      vars: fence
        ? parseEnv(fence.token.content)
        : items.length
          ? items.map((item) =>
              envVarFromList(
                proseText(normalizeProseWhitespace(content(item))),
                bold(content(item)),
              ),
            )
          : parseEnv(tree.map((block) => proseText(content(block))).join('')),
    }
  }
  if (name === 'GraphStack') {
    if (tree.some((block) => block.tag !== 'ul'))
      throw new Error('GraphStack requires direct bullet lists')
    return {
      rows: tree.flatMap((list) =>
        list.children.map((item) => {
          if (item.children.some((block) => block.tag !== 'p' && block.tag !== 'inline'))
            throw new Error('Nested list items are not supported')
          // Match the runtime reader whitespace normalization across inline boundaries.
          const raw = content(item)
          const prose = normalizeProseWhitespace(raw)
          const text = proseText(prose)
          const { label, rest } = splitLabel(text)
          const start = text.indexOf(label)
          const labelContent = sliceProse(prose, start, start + label.length)
          return {
            label,
            segments: segmentsFromText(rest),
            ...(labelContent.some((node) => node.type !== 'text') ? { labelContent } : {}),
          }
        }),
      ),
    }
  }
  const tables = tree.filter((block) => block.tag === 'table')
  const table = tables[0]
  const head = table?.children.find((block) => block.tag === 'thead')?.children[0]
  const rows = table?.children.find((block) => block.tag === 'tbody')?.children ?? []
  if (name === 'GraphTable') {
    if (tree.length !== 1 || !head) throw new Error('GraphTable requires one Markdown table')
    return readTable(table!)!
  }
  if (tree.some((block) => !['p', 'table', 'fence'].includes(block.tag)) || tables.length > 1)
    throw new Error('Endpoint requires paragraphs, one parameter table, and fences')
  const paragraphs = tree.filter((block) => block.tag === 'p').map(content)
  const match = paragraphs.map((nodes) => proseText(nodes).match(route)).find(Boolean)
  return {
    method: (match?.[1] ?? 'GET').toUpperCase(),
    path: match?.[2] ?? '/',
    about: paragraphs.filter((nodes) => !route.test(proseText(nodes))),
    params: rows.map((row) => {
      const [name, type, description] = row.children
      const prose = description ? content(description) : []
      return {
        name: name ? proseText(content(name)).trim() : '',
        type: type ? proseText(content(type)).trim() || undefined : undefined,
        required: name ? bold(content(name)) : false,
        description: proseText(prose).trim() ? prose : undefined,
      }
    }),
    blocks: tree
      .filter((block) => block.tag === 'fence')
      .map(({ token }) => {
        const code = token.content.replace(/\n$/, '')
        return {
          label: /^\s*(\$ |curl\b)/.test(code)
            ? 'request'
            : token.info.trim().match(/^[^\s:{[]+/)?.[0],
          code,
        }
      }),
  }
}
