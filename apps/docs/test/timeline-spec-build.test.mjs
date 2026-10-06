import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
const vueRequire = createRequire(import.meta.resolve('../../../packages/mdxcn-vue/package.json'))
const { JSDOM } = vueRequire('jsdom')
const doc = new JSDOM(readFileSync(new URL('../.vitepress/dist/test/fixtures/timeline-spec.html', import.meta.url), 'utf8')).window.document
const figures = [...doc.querySelectorAll('figure')]
const texts = (f, selector) => [...f.querySelectorAll(selector)].map(n => n.textContent)
test('shipped and incident match independent upstream dates, labels, states and connectors', () => {
  assert.equal(figures.length, 16)
  for (const [indexes, dates, labels] of [
    [[0,1,12,13], ['Mar 12','Mar 18','Apr 02'], ['CLI copies the files','Docs, live previews','Registry listed']],
    [[2,3], ['14:02','14:11','14:40'], ['p95 crossed 800ms','rolled back the cache flag','write the postmortem']],
  ]) for (const index of indexes) {
    const f=figures[index]
    assert.deepEqual(texts(f,'li > div:first-child > span:nth-child(2)'),dates)
    assert.deepEqual(texts(f,'li > div:first-child > span:last-child > span'),labels)
    assert.deepEqual(texts(f,'li > div:first-child > span:first-child'),['●','●','○'])
    assert.equal(f.querySelector('ol').getAttribute('role'),'list')
    assert.equal(f.querySelectorAll('li > div[aria-hidden="true"]').length,2)
    assert.equal(f.querySelectorAll('li > div:first-child > span[aria-hidden="true"]').length,3)
    assert.equal(f.querySelectorAll('li > div:first-child > span:first-child')[1].className,'text-center leading-none select-none text-graph-accent')
    assert.equal(f.querySelectorAll('li > div:first-child > span:first-child')[2].className,'text-center leading-none select-none text-graph-muted')
  }
})
test('night notes keep dash and body content separate from event headings',()=>{
  for(const f of figures.slice(4,6)) {
    assert.deepEqual(texts(f,'li > div:first-child > span:last-child > span'),['p95 crossed 800ms','rolled back the cache flag','write the postmortem'])
    assert.deepEqual(texts(f,'li .leading-relaxed'),['paged the on-call','Errors stopped inside a minute. Latency took ten.'])
    assert.deepEqual(texts(f,'li p'),['Errors stopped inside a minute. Latency took ten.'])
  }
})
test('type and ship-to specs match independent labels, values and accent',()=>{
  for(const [indexes,labels,values] of [
    [[6,7,14,15],['Family','Size','Tracking','Figures','Accent'],['Geist Mono','14 / 21','+0.02em','tabular','--graph-accent']],
    [[8,9],['Name','City','Carrier','ETA'],['A. Rao','Bengaluru','Delhivery','Thu']],
  ]) for(const index of indexes) {
    const f=figures[index]
    assert.deepEqual(texts(f,'dt'),labels);assert.deepEqual(texts(f,'dd > span'),values)
    assert.equal(f.querySelector('dl').className,'flex flex-col gap-3')
    assert.equal(f.querySelector('dl > div').className,'grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] items-baseline gap-x-3 sm:gap-x-6')
    assert.equal([...f.querySelectorAll('dd > span')].at(-1).className,'tabular-nums text-graph-accent')
  }
})
test('install spec retains code, external links, body note and rich wrapper classes',()=>{
  for(const f of figures.slice(10,12)) {
    assert.deepEqual(texts(f,'dt'),['Command','Lands in','Needs'])
    assert.deepEqual(texts(f,'dd code'),['pnpm dlx shadcn@latest add @mdxcn/all','registry/default'])
    assert.deepEqual(texts(f,'dd p'),['Edit it there. Nothing to update later.'])
    const a=f.querySelector('a');assert.equal(a.textContent,'motion');assert.equal(a.href,'https://motion.dev/');assert.equal(a.target,'_blank');assert.equal(a.rel,'noreferrer')
    for(const rich of f.querySelectorAll('dd > div:first-child')) assert.ok(rich.classList.contains('[overflow-wrap:anywhere]'))
  }
})
test('compiler, host, data and item paths have equal visible DOM with unique caption associations',()=>{
  const ids=new Set()
  const normalized=figures.map(f=>{
    assert.doesNotMatch(f.outerHTML,/opacity:\s*0|translateY/)
    const caption=f.querySelector('figcaption');assert.ok(caption.id&&!ids.has(caption.id));ids.add(caption.id)
    assert.equal(f.getAttribute('aria-labelledby'),caption.id)
    const clone=f.cloneNode(true),walker=doc.createTreeWalker(clone,128),comments=[]
    while(walker.nextNode())comments.push(walker.currentNode)
    comments.forEach(node=>node.remove())
    return clone.outerHTML.replaceAll(caption.id,'caption')
  })
  for(const [a,b] of [[0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[0,12],[0,13],[6,14],[6,15]])assert.equal(normalized[a],normalized[b])
})
test('timeline and spec docs render six upstream examples with resolved components',()=>{
  for(const slug of ['graph-timeline','graph-spec']){
    const html=readFileSync(new URL(`../.vitepress/dist/components/${slug}.html`,import.meta.url),'utf8')
    const document=new JSDOM(html).window.document
    assert.equal(document.querySelectorAll('figure').length,3)
    assert.equal(document.querySelectorAll('figure figure').length,0)
    assert.doesNotMatch(html,/<(?:GraphTimeline|GraphSpec|Event|Field)\b/)
  }
})
