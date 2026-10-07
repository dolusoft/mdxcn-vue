/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { defineComponent, h } from 'vue'
import type { Component, VNode } from 'vue'
import { childrenOf, flattenNodes } from './items.js'
import { Graph, GraphBody } from '../components/graph-frame.js'

export type NumericProps = readonly string[]
export interface GraphAdapter {
  numeric?: NumericProps
  required?: readonly string[]
}

/** Vue keeps native class attributes; binding prefixes and scalar types are normalized. */
export function coerceProps(raw: Record<string, unknown>, numeric: NumericProps = []) {
  const out: Record<string, unknown> = {}
  for (const [rawKey, rawValue] of Object.entries(raw)) {
    if (rawKey.startsWith('$') || rawKey === '__node') continue
    const unprefixed = rawKey.startsWith(':') ? rawKey.slice(1) : rawKey
    const key = /^(data|aria)-/.test(unprefixed)
      ? unprefixed
      : unprefixed.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
    let value = rawValue === 'true' ? true : rawValue === 'false' ? false : rawValue
    if (numeric.includes(key) && typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value.trim())
      if (Number.isFinite(parsed)) value = parsed
    }
    // Machine-controlled prototype keys must not alter the output object.
    Object.defineProperty(out, key, { value, enumerable: true, configurable: true, writable: true })
  }
  return out
}

export const PendingGraph = defineComponent({
  name: 'PendingGraph',
  props: { title: String },
  setup(props) {
    return () =>
      h(Graph, { title: props.title }, () =>
        h(GraphBody, { class: 'flex items-center justify-center py-14' }, () =>
          h('span', { class: 'font-mono text-sm text-graph-frame select-none' }, '· · ·'),
        ),
      )
  },
})

export const GraphRow = defineComponent({
  name: 'GraphRow',
  inheritAttrs: false,
  props: { cols: { type: [Number, String], default: 2 } },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'div',
        {
          ...attrs,
          class: [
            'grid gap-4',
            Number(props.cols) <= 1
              ? 'grid-cols-1'
              : Number(props.cols) >= 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2',
            attrs.class,
          ],
        },
        slots.default?.(),
      )
  },
})

function present(value: unknown) {
  return (
    value != null &&
    (Array.isArray(value)
      ? value.length > 0
      : typeof value === 'string'
        ? value.trim() !== ''
        : true)
  )
}

/** Recreate only host nodes that contain item tags; custom components stay opaque. */
function itemsIn(nodes: VNode[], items: Record<string, Component>, row: Component): VNode[] {
  return nodes.map((node) => {
    const tag =
      typeof node.type === 'string'
        ? node.type.toLowerCase()
        : node.type === row
          ? 'row'
          : undefined
    if (!tag || tag === 'pre' || tag === 'code') return node
    const marker = items[tag]
    const original = childrenOf(node)
    const children = itemsIn(original, items, row)
    if (marker) return h(marker, coerceProps(node.props ?? {}), { default: () => children })
    if (children.some((child, i) => child !== original[i]))
      return h(node.type as string, node.props, children)
    return node
  })
}

function propsKey(props: Record<string, unknown>): string | undefined {
  try {
    return Object.entries(props)
      .filter(([key]) => key !== 'children')
      .map(
        ([key, value]) =>
          `${key}=${typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}`,
      )
      .join('|')
  } catch {
    return undefined
  }
}

export function fromMarkdown(
  component: Component,
  adapter: GraphAdapter = {},
  items: Record<string, Component> = {},
  row: Component = GraphRow,
) {
  return defineComponent({
    name: 'FromMarkdown',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        const props = coerceProps(attrs, adapter.numeric)
        const nodes = itemsIn(flattenNodes(slots.default?.() ?? []), items, row)
        const written = nodes.length > 0
        if (!written && !(adapter.required ?? []).every((key) => present(props[key])))
          return h(PendingGraph, { title: props.title as string | undefined })
        return h(component, { ...props, key: propsKey(props) }, { ...slots, default: () => nodes })
      }
    },
  })
}
