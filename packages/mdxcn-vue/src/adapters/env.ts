/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { VNode } from 'vue'
import type { EnvVar } from '../core/env.js'
import { parseEnv, envVarFromList } from '../core/env.js'
import { childrenOf, flattenNodes, textOf } from './items.js'
import { codeReaderNodes, readerListItems } from './code-readers.js'

function hasBold(nodes: readonly VNode[]): boolean {
  return flattenNodes(nodes).some(
    (node) =>
      typeof node.type === 'string' &&
      (node.type === 'strong' || node.type === 'b' || hasBold(childrenOf(node))),
  )
}
export function envModel(
  vars: readonly EnvVar[] | null | undefined,
  nodes: readonly VNode[],
): readonly EnvVar[] {
  if (vars != null) return vars
  const elements = codeReaderNodes(nodes)
  const pre = elements.find((node) => node.type === 'pre')
  if (pre) return parseEnv(textOf([pre]))
  const listed = readerListItems(elements).map((item) => {
    const children = childrenOf(item)
    // Upstream itemText omits nested lists when reading a row.
    const row = children.filter((node) => node.type !== 'ol' && node.type !== 'ul')
    return envVarFromList(textOf(row).replace(/\s+/g, ' ').trim(), hasBold(children))
  })
  return listed.length ? listed : parseEnv(textOf(elements))
}
