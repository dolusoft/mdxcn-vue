import type MarkdownIt from 'markdown-it'
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

export type ComponentName = 'GraphStack' | 'GraphTable' | 'Endpoint'
export type CompiledProps =
  | { rows: StackRow[] }
  | TableModel
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
    else if (['strong_open', 'em_open', 'link_open'].includes(token.type)) {
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
          : { type: token.type === 'strong_open' ? 'strong' : 'em', children: [] }
      children.push(node)
      stack.push(node.children)
    } else if (['strong_close', 'em_close', 'link_close'].includes(token.type)) stack.pop()
    else throw new Error(`Unsupported inline token: ${token.type}`)
  }
  return root
}

function blocks(
  tokens: readonly Token[],
  md: MarkdownIt,
  env: object,
  options: TokenModelOptions,
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
        ),
      })
    } else if (token.type === 'fence') stack.at(-1)!.push({ tag: 'fence', token, children: [] })
    else if (token.nesting === 1 && allowed.has(token.tag)) {
      const block: Block = { tag: token.tag, token, children: [] }
      stack.at(-1)!.push(block)
      stack.push(block.children)
    } else if (token.nesting === -1 && allowed.has(token.tag)) stack.pop()
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
  const tree = blocks(tokens, md, env, options)
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
    const last = rows.at(-1)
    const first = last?.children[0] ? trim(content(last.children[0])) : []
    const total =
      rows.length > 1 &&
      (/^total$/i.test(proseText(first)) || (first.length === 1 && first[0]?.type === 'strong'))
    const align = head.children.map(
      (block) =>
        block.token.attrGet('style')?.match(/text-align:(left|right)/)?.[1] as
          'left' | 'right' | undefined,
    )
    return {
      headers: head.children.map((block) => proseText(normalizeProseWhitespace(content(block)))),
      rows: (total ? rows.slice(0, -1) : rows).map((row) => row.children.map(cell)),
      ...(total && last ? { footer: last.children.map(cell) } : {}),
      ...(align.some(Boolean)
        ? { align: align.map((value, index) => value ?? (index === 0 ? 'left' : 'right')) }
        : {}),
    }
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
