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
test('uptime/countdown production compiler, runtime and direct props preserve DOM',()=> {
  const figures=[...page('test/fixtures/uptime-countdown').querySelectorAll('figure')]
  assert.equal(figures.length,21)
  for(let i=0;i<figures.length;i+=3) {
    assert.equal(normalize(figures[i]),normalize(figures[i+1])); assert.equal(normalize(figures[i]),normalize(figures[i+2]))
    assert.doesNotMatch(figures[i+1].outerHTML,/header-anchor|opacity:0(?:;|"|$)|translateY/)
  }
  assert.equal(figures[0].querySelector('.sr-only').textContent,'94 percent uptime over 90 days, Jun 1 to Aug 29')
  assert.equal(figures[6].querySelector('.sr-only').textContent,'remaining 00:00:00')
  assert.match(figures[18].textContent,/until launch with bold text/)
})
test('uptime/countdown docs render all five upstream examples visibly',()=> {
  for(const [slug,count] of [['graph-uptime',2],['graph-countdown',3]]) {
    const figures=[...page('docs/'+slug).querySelectorAll('figure')]
    assert.equal(figures.length,count)
    for(const f of figures) assert.doesNotMatch(f.outerHTML,/header-anchor|opacity:0(?:;|"|$)|translateY|<(?:GraphUptime|GraphCountdown)\b/)
  }
})
test('built SSR is byte-identical across UTC, Istanbul and Los Angeles with Turkish process locale', () => {
  const cwd = fileURLToPath(new URL('../../../packages/mdxcn-vue/', import.meta.url))
  const script = `
    import {createRequire} from 'node:module';
    const require=createRequire(process.cwd()+'/package.json');
    const {createSSRApp,h}=require('vue');
    const {renderToString}=require('vue/server-renderer');
    const {GraphUptime,GraphCountdown}=await import('./dist/index.js');
    const {parseInstant}=await import('./dist/core.js');
    const fixtures=require('./test/fixtures/uptime-countdown-examples.json');
    const html=[];
    for(const c of fixtures) html.push(await renderToString(createSSRApp({render:()=>h(c.name==='GraphUptime'?GraphUptime:GraphCountdown,{...c.props,...c.model})})));
    const instants=['2024-02-29','2023-02-29','2026-03-08T02:30:00','2026-11-01T01:30:00','2026-03-31T23:59:59','2026-03-08T02:30:00-08:00'].map(value=>parseInstant(value,true));
    console.log(JSON.stringify({locale:Intl.DateTimeFormat().resolvedOptions().locale,instants,offset:new Date('2026-03-10T12:00:00Z').getTimezoneOffset(),html}));
  `
  const results = ['UTC', 'Europe/Istanbul', 'America/Los_Angeles'].map(TZ => {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {cwd, encoding:'utf8', env:{...process.env,TZ,LANG:'tr_TR.UTF-8',LC_ALL:'tr_TR.UTF-8'}})
    assert.equal(result.status,0,result.stderr)
    const value=JSON.parse(result.stdout)
    assert.equal(value.locale,'tr-TR')
    return value
  })
  assert.deepEqual(results.map(result=>result.offset),[0,-180,420])
  assert.deepEqual(results[0].instants,results[1].instants)
  assert.deepEqual(results[0].instants,results[2].instants)
  assert.deepEqual(results[0].html,results[1].html)
  assert.deepEqual(results[0].html,results[2].html)
})
