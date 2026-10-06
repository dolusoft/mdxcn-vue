import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const require = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = require('jsdom')
const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/numeric-list.html', import.meta.url),'utf8')).window.document
const figures=[...doc.querySelectorAll('figure')]
const texts=(f,s)=>[...f.querySelectorAll(s)].map(n=>n.textContent)
test('six upstream examples match independent values, labels, glyphs and ratios',()=>{
  assert.equal(figures.length,20)
  for(const [start,labels,values] of [
    [0,['Performance','Accessibility','Docs','Motion'],['4/5','5/5','2.5/5','4/5']],
    [3,['Acme','Globex','Initech'],['8/10','6.5/10','4/10']],
    [6,['/docs','/install','/plot','/rank'],['12,400','4,100','860','420']],
    [10,['frame','plot','invoice'],['100%','82%','41%']],
    [13,['docs','copy','ship'],['12,400','4,100','860']],
    [17,['visit','start','verify','paid'],['8,000','2,400','960','180']],
  ]) {
    const f=figures[start]
    assert.deepEqual(texts(f,'li > span:first-child'),labels)
    assert.deepEqual(texts(f,start<13?'li > span:last-child':'li > span:nth-last-child(2)'),values)
  }
  assert.ok(figures[0].querySelectorAll('li')[2].textContent.includes('●●◐○○'))
  assert.ok(figures[3].querySelectorAll('li')[1].textContent.includes('@@@@@@-...'))
  assert.ok(figures[6].querySelectorAll('li')[1].textContent.includes('[=======-------------]'))
  assert.deepEqual(texts(figures[13],'li > span:last-child'),['','33%','7%'])
  assert.deepEqual(texts(figures[17],'li > span:last-child'),['','30%','12%','2%'])
  assert.equal(figures[13].querySelector('li').style.opacity,'0.4')
})
test('compiler, runtime, props and markers render equal DOM and unique captions',()=>{
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
  for(const group of [[0,1,2],[3,4,5],[6,7,8,9],[10,11,12],[13,14,15,16],[17,18,19]])
    for(const index of group.slice(1))assert.equal(normalized[index],normalized[group[0]])
})
