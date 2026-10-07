import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/stat-slope-bullet.html', import.meta.url),'utf8')).window.document
const figures=[...doc.querySelectorAll('figure')]
const texts=(f,s)=>[...f.querySelectorAll(s)].map(n=>n.textContent)
test('six stat/slope/bullet upstream fixtures match independent values, hints and targets',()=>{
  assert.equal(figures.length,24)
  assert.deepEqual(texts(figures[0],'li > p:first-child'),['12,400','4,100','860'])
  assert.deepEqual(texts(figures[0],'li > p:nth-child(2)'),['docs','copies','shipped'])
  assert.ok(figures[0].querySelectorAll('li')[2].querySelector('p').classList.contains('text-graph-accent'))
  assert.deepEqual(texts(figures[4],'li > p:first-child'),['142ms','410ms'])
  assert.deepEqual(texts(figures[4],'li > p:last-child'),['−18ms','+22ms'])
  assert.deepEqual(texts(figures[8],'li > span:nth-child(2)'),['8,200','5,100','640'])
  assert.deepEqual(texts(figures[8],'li > span:last-child'),['12,400','4,100','860'])
  assert.deepEqual(texts(figures[12],'li > span:last-child'),['142','410','12'])
  assert.deepEqual(texts(figures[12],'li > span:nth-child(3)'),['→','→','–'])
  assert.deepEqual(texts(figures[16],'li > span:last-child'),['42 / 40','18 / 24','9 / 12'])
  assert.deepEqual(texts(figures[16],'li > span:nth-child(2)'),['[===================|]','[===============----|]','[===============----|]'])
  assert.deepEqual(texts(figures[20],'li > span:last-child'),['72 / 80','34 / 64','91 / 90'])
  assert.deepEqual(texts(figures[20],'li > span:nth-child(2)'),['[==============--|---]','[=======------|------]','[==================|-]'])
  assert.equal(figures[20].querySelector('li').getAttribute('aria-label'),'CPU 72 / 80')
})
test('compiler, runtime, props and item paths render equal DOM with unique accessible captions',()=>{
  const ids=new Set()
  const normalized=figures.map(f=>{
    const caption=f.querySelector('figcaption');assert.ok(caption.id&&!ids.has(caption.id));ids.add(caption.id)
    assert.equal(f.getAttribute('aria-labelledby'),caption.id)
    assert.doesNotMatch(f.outerHTML,/opacity:\s*0(?:;|"|$)|translateY/)
    const clone=f.cloneNode(true),walker=doc.createTreeWalker(clone,128),comments=[]
    while(walker.nextNode())comments.push(walker.currentNode)
    comments.forEach(n=>n.remove())
    return clone.outerHTML.replaceAll(caption.id,'caption')
  })
  for(let start=0;start<24;start+=4)
    for(let offset=1;offset<4;offset++)assert.equal(normalized[start+offset],normalized[start])
})
test('stat, slope and bullet docs resolve both upstream examples',()=>{
  for(const slug of ['graph-stat','graph-slope','graph-bullet']){
    const html=readFileSync(new URL(`../.vitepress/dist/docs/${slug}.html`,import.meta.url),'utf8')
    const page=new JSDOM(html).window.document
    assert.equal(page.querySelectorAll('figure').length,2)
    assert.doesNotMatch(page.querySelector('.vp-doc').innerHTML,/<(?:GraphStat|GraphSlope|GraphBullet|Stat|Slope|Target)\b/)
  }
})
