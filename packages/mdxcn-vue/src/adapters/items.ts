import { Comment, Fragment, Text, createTextVNode, defineComponent, isVNode } from 'vue'
import type { Component, VNode } from 'vue'
import { numberOf } from '../core/stack'

export interface ItemField {
  type: 'string' | 'number' | 'boolean' | 'array'
  default?: unknown
}
export type ItemSchema = Record<string, ItemField>
const schemas = new WeakMap<object, ItemSchema>()

/** Declarative item markers are consumed by the parent, never rendered. */
export function defineItem(name: string, schema: ItemSchema) {
  const component = defineComponent({ name, setup: () => () => null })
  schemas.set(component, schema)
  return component
}

/** Only fragments are transparent. Custom component wrappers stay opaque. */
export function flattenNodes(input: unknown): VNode[] {
  if (Array.isArray(input)) return input.flatMap(flattenNodes)
  if (typeof input === 'string' || typeof input === 'number')
    return [createTextVNode(String(input))]
  if (!isVNode(input) || input.type === Comment) return []
  return input.type === Fragment ? flattenNodes(input.children) : [input]
}

export function childrenOf(node: VNode): VNode[] {
  if (typeof node.type === 'string' || node.type === Fragment) return flattenNodes(node.children)
  const slots = node.children
  return slots &&
    !Array.isArray(slots) &&
    typeof slots === 'object' &&
    typeof slots.default === 'function'
    ? flattenNodes(slots.default())
    : []
}

export function textOf(nodes: readonly VNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === Text || typeof node.children === 'string')
        return String(node.children ?? '')
      return typeof node.type === 'string' || node.type === Fragment ? textOf(childrenOf(node)) : ''
    })
    .join('')
}

export function normalizeItemProps(
  props: Record<string, unknown> | null,
  schema: ItemSchema,
): Record<string, unknown> {
  const camelProps = Object.fromEntries(
    Object.entries(props ?? {}).map(([key, value]) => [
      key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()),
      value,
    ]),
  )
  return Object.fromEntries(
    Object.entries(schema).map(([name, field]) => {
      let value = camelProps[name]
      if (value === undefined) value = field.default
      if (field.type === 'boolean')
        value =
          value === '' ||
          value === true ||
          value === name ||
          value === name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      if (field.type === 'number' && typeof value === 'string') value = numberOf(value)
      if (field.type === 'array' && !Array.isArray(value)) value = field.default
      return [name, value]
    }),
  )
}

export function childItems(nodes: readonly VNode[], component: Component) {
  const schema = schemas.get(component as object)
  if (!schema) return []
  return flattenNodes(nodes)
    .filter((node) => node.type === component)
    .map((node) => ({ props: normalizeItemProps(node.props, schema), children: childrenOf(node) }))
}
