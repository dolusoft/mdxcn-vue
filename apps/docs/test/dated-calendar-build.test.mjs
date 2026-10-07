import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const page = slug => new JSDOM(readFileSync(new URL(`../.vitepress/dist/${slug}.html`,import.meta.url),'utf8')).window.document
const normalize = f => f.outerHTML.replace(/<!--[\s\S]*?-->/g,'').replace(/ id="[^"]*"/g,'').replace(/ aria-labelledby="[^"]*"/g,'')
test('dated/calendar production compiler, runtime and direct models preserve DOM including runs and softbreaks',()=> {
  const figures=[...page('test/fixtures/dated-calendar').querySelectorAll('figure')]
  assert.equal(figures.length,27)
  for(let i=0;i<figures.length;i+=3) {
    assert.equal(normalize(figures[i]),normalize(figures[i+1])); assert.equal(normalize(figures[i]),normalize(figures[i+2]))
    assert.doesNotMatch(figures[i+1].outerHTML,/header-anchor|opacity:0(?:;|"|$)|translateY/)
  }
  assert.equal(figures[18].querySelector('.sr-only').textContent,'5 contributions across 5 days')
  assert.equal(figures[21].querySelector('.sr-only').textContent,'February 2024, today 29, marked 29')
  assert.equal(figures[24].querySelector('.sr-only').textContent,'March 2026, today 18, marked 12')
})
test('dated/calendar documentation renders all six upstream examples visibly',()=> {
  for(const slug of ['graph-activity','graph-calendar']) {
    const figures=[...page(`components/${slug}`).querySelectorAll('figure')]
    assert.equal(figures.length,3)
    for(const f of figures) assert.doesNotMatch(f.outerHTML,/header-anchor|opacity:0(?:;|"|$)|translateY|<(?:GraphActivity|GraphCalendar)\b/)
  }
})
test('built SSR is byte-identical across UTC, Istanbul and Los Angeles with Turkish process locale', () => {
  const cwd = fileURLToPath(new URL('../../../packages/mdxcn-vue/', import.meta.url))
  const script = `
    import {createRequire} from 'node:module';
    const require=createRequire(process.cwd()+'/package.json');
    const {createSSRApp,h}=require('vue');
    const {renderToString}=require('vue/server-renderer');
    const {GraphActivity,GraphCalendar}=await import('./dist/index.js');
    const {activityDays}=await import('./dist/core.js');
    const fixtures=require('./test/fixtures/dated-calendar-examples.json');
    const html=[];
    for(const c of fixtures) html.push(await renderToString(createSSRApp({render:()=>h(c.name==='GraphActivity'?GraphActivity:GraphCalendar,{...c.props,...c.model})})));
    for(const start of ['2024-02-28','2026-03-07','2026-10-31']) html.push(await renderToString(createSSRApp({render:()=>h(GraphActivity,{title:'DST',days:activityDays([start+': 1200*5'])})})));
    console.log(JSON.stringify({locale:Intl.DateTimeFormat().resolvedOptions().locale,offset:new Date('2026-03-10T12:00:00Z').getTimezoneOffset(),html}));
  `
  const results = ['UTC', 'Europe/Istanbul', 'America/Los_Angeles'].map(TZ => {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {cwd, encoding:'utf8', env:{...process.env,TZ,LANG:'tr_TR.UTF-8',LC_ALL:'tr_TR.UTF-8'}})
    assert.equal(result.status,0,result.stderr)
    const value=JSON.parse(result.stdout)
    assert.equal(value.locale,'tr-TR')
    return value
  })
  assert.deepEqual(results.map(result=>result.offset),[0,-180,420])
  assert.deepEqual(results[0].html,results[1].html)
  assert.deepEqual(results[0].html,results[2].html)
})
