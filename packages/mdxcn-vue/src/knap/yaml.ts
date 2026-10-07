/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isScalar(value: unknown) {
  return (
    value == null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

function yamlString(value: string) {
  if (value === '') return '""'
  if (
    /^[A-Za-z_][A-Za-z0-9_-]*$/.test(value) &&
    !/^(?:null|true|false|yes|no|on|off)$/i.test(value)
  )
    return value
  return JSON.stringify(value)
}

function yamlScalar(value: unknown): string {
  if (value == null) return 'null'
  if (typeof value === 'boolean' || typeof value === 'number') {
    if (typeof value === 'number' && !Number.isFinite(value))
      throw new Error('Non-finite YAML value')
    return String(value)
  }
  if (typeof value === 'string') return yamlString(value)
  throw new Error('Unsupported YAML value')
}

function flowMap(value: Record<string, unknown>) {
  const parts = Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .map(([key, item]) => `${yamlString(key)}: ${yamlScalar(item)}`)
  return `{ ${parts.join(', ')} }`
}

function yamlValue(value: unknown, indent: number): string {
  const pad = ' '.repeat(indent)

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (value.every(isScalar)) {
      return `[${value.map((item) => yamlScalar(item)).join(', ')}]`
    }
    if (value.every((item) => isPlainObject(item) && Object.values(item).every(isScalar))) {
      return value.map((item) => `\n${pad}- ${flowMap(item as Record<string, unknown>)}`).join('')
    }
    return value
      .map((item) => {
        if (isPlainObject(item)) {
          const nested = yamlObject(item, indent + 2)
          if (!nested) return `\n${pad}- {}`
          const lines = nested.split('\n')
          const first = lines[0]?.trimStart() ?? ''
          const rest = lines.slice(1).join('\n')
          return `\n${pad}- ${first}${rest ? `\n${rest}` : ''}`
        }
        return `\n${pad}- ${yamlValue(item, indent + 2)}`
      })
      .join('')
  }

  if (isPlainObject(value)) {
    if (Object.values(value).every((item) => item === undefined)) return '{}'
    return '\n' + yamlObject(value, indent)
  }

  return yamlScalar(value)
}

function yamlObject(value: Record<string, unknown>, indent: number) {
  const pad = ' '.repeat(indent)
  const lines: string[] = []

  for (const [key, item] of Object.entries(value)) {
    if (item === undefined) continue
    const rendered = yamlValue(item, indent + 2)
    if (rendered.startsWith('\n')) {
      lines.push(`${pad}${yamlString(key)}:${rendered}`)
    } else {
      lines.push(`${pad}${yamlString(key)}: ${rendered}`)
    }
  }

  return lines.join('\n')
}

export function toYaml(value: Record<string, unknown>) {
  return yamlObject(value, 0)
}

/**
 * A `::tag` block. `body` is Markdown and goes inside the block, after the
 * YAML — the same grammar MDX children use.
 */
export function toComarkBlock(tag: string, props: Record<string, unknown>) {
  const { body, ...rest } = props
  const yaml = toYaml(rest).trimEnd()
  const text = typeof body === 'string' && body.trim() ? `${body.trim()}\n` : ''
  if (!yaml) {
    return `::${tag}\n${text}::`
  }
  return `::${tag}\n---\n${yaml}\n---\n${text}::`
}
