import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const page = (slug) => new JSDOM(readFileSync(new URL(`../.vitepress/dist/${slug}.html`,import.meta.url),'utf8')).window.document
const normalize = (f) => f.outerHTML.replace(/<!--[\s\S]*?-->/g,'').replace(/ id="[^"]*"/g,'').replace(/ aria-labelledby="[^"]*"/g,'')
test('Plot and KPI retain equal compiler/runtime/model DOM in production VitePress',()=>{
  const figures=[...page('test/fixtures/plot-kpi').querySelectorAll('figure')]
  assert.equal(figures.length,12)
  for(let i=0;i<figures.length;i+=3){
    assert.equal(normalize(figures[i]),normalize(figures[i+1]))
    assert.equal(normalize(figures[i]),normalize(figures[i+2]))
    assert.doesNotMatch(figures[i+1].outerHTML,/header-anchor|opacity:0(?:;|"|$)|translateY/)
  }
  assert.equal(figures[0].querySelector('.sr-only').textContent,'line plot, 5 points, min 0, max 31')
  assert.equal(figures[3].querySelector('.sr-only').textContent,'12,400 this week. +18%')
})
test('Plot and KPI docs render all six upstream examples visibly',()=>{
  for(const slug of ['graph-plot','graph-kpi']){
    const figures=[...page(`components/${slug}`).querySelectorAll('figure')]
    assert.equal(figures.length,3)
    for(const f of figures) assert.doesNotMatch(f.outerHTML,/header-anchor|opacity:0(?:;|"|$)|translateY|<(?:GraphPlot|GraphKpi)\b/)
  }
})
