import type MarkdownIt from 'markdown-it'
import type { ComponentName } from './model.js'

export type UpgradeComponent = 'Callout' | 'Quote' | 'Terminal' | 'Footnotes'
export interface MarkdownWarning {
  file: string
  line: number
  component: ComponentName | UpgradeComponent
  reason: string
}
export interface WarningOptions {
  warn?: (warning: MarkdownWarning) => void
}
interface SourceEnv {
  path?: string
  filePath?: string
  relativePath?: string
  mdxcnSource?: string
}
const tracked = new WeakSet<MarkdownIt>()
export function trackSource(md: MarkdownIt): void {
  if (tracked.has(md)) return
  tracked.add(md)
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
}
export function emitWarning(
  options: WarningOptions,
  env: SourceEnv,
  source: string,
  start: number,
  component: MarkdownWarning['component'],
  reason: string,
): void {
  const original = env.mdxcnSource
  const offset = original?.endsWith(source)
    ? (original.slice(0, original.length - source.length).match(/\n/g)?.length ?? 0)
    : 0
  const warning = {
    file: env.path ?? env.filePath ?? env.relativePath ?? '<markdown>',
    line: start + 1 + offset,
    component,
    reason,
  }
  if (options.warn) options.warn(warning)
  else console.warn(`[mdxcn-markdown] ${warning.file}:${warning.line} ${component}: ${reason}`)
}
export const escapeAttribute = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')

type CoreState = import('markdown-it/lib/rules_core/state_core.mjs').default
type Finalizer = (state: CoreState) => void
const finalizers = new WeakMap<MarkdownIt, Partial<Record<'compile' | 'upgrades', Finalizer>>>()
/** Run compilation before upgrade diagnostics, independent of plugin registration order. */
export function registerFinalizer(md: MarkdownIt, phase: 'compile' | 'upgrades', rule: Finalizer): void {
  let rules = finalizers.get(md)
  if (!rules) {
    rules = {}
    finalizers.set(md, rules)
    const run: Finalizer = state => {
      rules!.compile?.(state)
      rules!.upgrades?.(state)
    }
    try { md.core.ruler.before('anchor', 'mdxcn_finalize', run) }
    catch { md.core.ruler.push('mdxcn_finalize', run) }
  }
  rules[phase] = rule
}
