/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { VNode } from 'vue'
import { normalizeClass } from 'vue'
import type { ProseNode } from '../core/model'
import { childrenOf, flattenNodes, textOf } from './items'
import { hostCells, rowsIn } from './table'

export interface EndpointParam {
  name: string
  type?: string
  description?: string | number | VNode | readonly VNode[] | readonly ProseNode[] | null
  required?: boolean
}
export interface EndpointBlock {
  label?: string
  code: string
}
export interface EndpointData {
  about?: readonly (readonly ProseNode[])[] | null
  method?: string | null
  path?: string | null
  params?: readonly EndpointParam[] | null
  blocks?: readonly EndpointBlock[] | null
}
const ROUTE = /^\s*(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|QUERY)\s+(\S+)\s*$/i
function hasBold(nodes: readonly VNode[]): boolean {
  return flattenNodes(nodes).some(
    (node) =>
      typeof node.type === 'string' &&
      (node.type === 'strong' || node.type === 'b' || hasBold(childrenOf(node))),
  )
}
function paramsOf(table?: VNode): EndpointParam[] {
  if (!table) return []
  const sections = childrenOf(table).filter((node) => typeof node.type === 'string')
  const body =
    sections.find((node) => node.type === 'tbody') ?? sections.find((node) => node.type !== 'thead')
  return rowsIn(body).map((row) => {
    const [name, type, description] = hostCells(row)
    return {
      name: name ? textOf(childrenOf(name)).trim() : '',
      type: type ? textOf(childrenOf(type)).trim() || undefined : undefined,
      description:
        description && textOf(childrenOf(description)).trim() ? childrenOf(description) : undefined,
      required: name ? hasBold(childrenOf(name)) : false,
    }
  })
}

function blocksOf(elements: readonly VNode[]): EndpointBlock[] {
  return elements
    .flatMap((node) => {
      if (node.type === 'pre') return [{ pre: node, wrapperClass: '' }]
      const wrapperClass = normalizeClass(node.props?.class)
      if (node.type !== 'div' || !/\blanguage-\S*/.test(wrapperClass)) return []
      return childrenOf(node)
        .filter((child) => child.type === 'pre')
        .map((pre) => ({ pre, wrapperClass }))
    })
    .map(({ pre, wrapperClass }) => {
      const code = childrenOf(pre).find((node) => node.type === 'code')
      const rawLanguage =
        wrapperClass.match(/language-(\S+)/)?.[1] ??
        normalizeClass(code?.props?.class ?? code?.props?.className).match(/language-(\S+)/)?.[1]
      const language = rawLanguage?.match(/^[^\s:{[]+/)?.[0]
      const text = textOf([pre]).replace(/\n$/, '')
      return { label: /^\s*(\$ |curl\b)/.test(text) ? 'request' : language, code: text }
    })
}

/** Match the upstream direct-host reader and select each data field independently. */
export function endpointModel(data: EndpointData, nodes: readonly VNode[]) {
  const elements = flattenNodes(nodes).filter((node) => typeof node.type === 'string')
  const paragraphs = elements.filter((node) => node.type === 'p')
  const route = paragraphs.map((node) => textOf([node]).match(ROUTE)).find(Boolean)
  return {
    method: (data.method ?? route?.[1] ?? 'GET').toUpperCase(),
    path: data.path ?? route?.[2] ?? '/',
    about: paragraphs.filter((node) => !ROUTE.test(textOf([node]))),
    params: data.params ?? paramsOf(elements.find((node) => node.type === 'table')),
    blocks: data.blocks ?? blocksOf(elements),
  }
}
