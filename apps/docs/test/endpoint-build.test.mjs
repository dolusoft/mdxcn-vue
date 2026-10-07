import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('built Endpoint examples preserve route, rich parameters and direct request/response blocks', () => {
  const html = readFileSync(new URL('../.vitepress/dist/docs/endpoint.html', import.meta.url), 'utf8')
  const figures = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map((match) => match[0])
  assert.equal(figures.length, 2)
  for (const figure of figures) {
    assert.ok(figure.includes('/api/v1/components/:slug'))
    assert.ok(figure.includes(' (required)</span>'))
    assert.ok(figure.includes('<code>graph-table</code>'))
    assert.ok(figure.includes('href="/docs/graph-table.html"'))
    assert.equal((figure.match(/<pre\b/g) ?? []).length, 2)
    assert.ok(figure.includes('$ curl https://mdxcn.dev/api/v1/components/graph-meter'))
    assert.ok(figure.includes('&quot;name&quot;: &quot;GraphMeter&quot;'))
    assert.doesNotMatch(figure, /opacity:\s*0(?:;|")|translateY/)
  }
  const ids = figures.map((figure) => figure.match(/<figcaption\b[^>]*id="([^"]+)"/)?.[1])
  assert.equal(new Set(ids).size, 2)
})
