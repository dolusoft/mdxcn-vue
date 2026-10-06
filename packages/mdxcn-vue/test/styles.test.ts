import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = (name: string) => readFileSync(`src/styles/${name}.css`, 'utf8')

/** Neutral OKLCH has zero chroma, so relative luminance equals L cubed. */
function luminance(block: string, name: string) {
  const match = block.match(new RegExp(`--${name}: oklch\\(([\\d.]+) 0 0\\)`))
  if (!match) throw new Error(`Missing neutral token: ${name}`)
  return Number(match[1]) ** 3
}

describe('CSS contracts', () => {
  it.each(['light', 'dark'])('%s graph-muted contrast is at least 4.5:1', (mode) => {
    const theme = css('theme')
    const block = theme.match(
      mode === 'light' ? /:root\s*\{([^}]+)\}/ : /\.dark\s*\{([^}]+)\}/,
    )?.[1]
    expect(block).toBeDefined()
    const bg = luminance(block!, 'background')
    const muted = luminance(block!, 'graph-muted')
    const ratio = (Math.max(bg, muted) + 0.05) / (Math.min(bg, muted) + 0.05)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
    console.info(`${mode} graph-muted contrast: ${ratio.toFixed(3)}:1`)
    // Host graph defaults must retain the same contrast-adjusted values.
    const host = css('host').match(
      mode === 'light' ? /:root\s*\{([^}]+)\}/ : /\.dark\s*\{([^}]+)\}/,
    )?.[1]
    expect(luminance(host!, 'graph-muted')).toBe(muted)
  })
  it('provides three isolated CSS exports and sideEffects', () => {
    const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
    for (const entry of ['graph', 'host', 'theme'])
      expect(manifest.exports[`./${entry}.css`]).toBe(`./dist/${entry}.css`)
    expect(manifest.sideEffects).toContain('**/*.css')
    expect(css('graph')).toMatch(/@source ['"]\.\.\/['"];/)
    expect(css('host')).toContain('--color-destructive: var(--destructive)')
    expect(css('host')).not.toMatch(/--background:\s|--foreground:\s|--destructive:\s/)
  })
  it('defines all six utilities and the measured four-gradient frame', () => {
    const graph = css('graph')
    for (const name of [
      'graph-frame',
      'graph-rule',
      'graph-rule-y',
      'graph-scroll-x',
      'scrollbar-graph',
      'graph-title-ink',
    ])
      expect(graph).toContain(`@utility ${name}`)
    expect(
      graph.match(/@utility graph-frame\s*\{([^}]+)\}/)?.[1]?.match(/repeating-linear-gradient/g),
    ).toHaveLength(4)
    expect(graph).toContain('transparent 2px 7px')
    expect(graph).not.toContain('scripting: enabled')
  })
  it('provides fourteen scoped presets with dark variants and six gradients', () => {
    const theme = css('theme')
    const accents = [...theme.matchAll(/^\[data-accent=['"]([^'"]+)['"]\]/gm)].map(
      (match) => match[1],
    )
    expect(accents).toEqual([
      'theme',
      'mint',
      'orange',
      'green',
      'cyan',
      'blue',
      'purple',
      'pink',
      'sunset',
      'ocean',
      'neon',
      'aurora',
      'fire',
      'prism',
    ])
    expect(theme.match(/--graph-title-color: transparent/g)).toHaveLength(6)
    for (const name of accents) expect(theme).toContain(`.dark [data-accent='${name}']`)
    expect(theme).not.toContain('html[data-accent')
  })
})
