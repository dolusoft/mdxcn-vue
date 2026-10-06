/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import type { VNode } from 'vue'
import type { ProseNode } from '../core/model.js'
import { parseAnnotatedCode } from '../core/annotate.js'
import { childrenOf, textOf } from './items.js'
import { codeLanguage, codeReaderNodes, readerListItems } from './code-readers.js'

export type AnnotateNote = string | number | VNode | readonly VNode[] | readonly ProseNode[] | null
export interface AnnotateData {
  code?: string | null
  notes?: readonly AnnotateNote[] | null
}
export function annotateModel(data: AnnotateData, nodes: readonly VNode[]) {
  const elements = codeReaderNodes(nodes)
  const pre = elements.find((node) => node.type === 'pre')
  return {
    language: codeLanguage(pre),
    lines: parseAnnotatedCode(data.code ?? (pre ? textOf([pre]) : '')),
    notes:
      data.notes ??
      readerListItems(elements.filter((node) => node.type === 'ol' || node.type === 'ul')).map(
        (item) => {
          const children = childrenOf(item).filter(
            (node) => node.type !== 'ol' && node.type !== 'ul',
          )
          const paragraph = children.find((node) => node.type === 'p')
          return paragraph
            ? [
                ...childrenOf(paragraph),
                ...children
                  .slice(children.indexOf(paragraph) + 1)
                  .filter((node) => typeof node.type === 'string'),
              ]
            : children
        },
      ),
  }
}
