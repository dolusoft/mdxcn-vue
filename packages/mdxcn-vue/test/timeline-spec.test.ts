import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { Fragment, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphTimeline, Event, GraphSpec, Field, childItems } from '../src'
import { timelineModel } from '../src/adapters/timeline-spec'
import { timelineFromList, specFromList } from '../src/core'
import type { StateListItem } from '../src/core'

const shipped = () =>
  h('ul', [
    h('li', 'Mar 12: CLI copies the files'),
    h('li', [h('strong', 'Mar 18: Docs, live previews')]),
    h('li', [h('em', 'Apr 02: Registry listed')]),
  ])
const type = () =>
  h('ul', [
    h('li', 'Family: Geist Mono'),
    h('li', 'Size: 14 / 21'),
    h('li', 'Tracking: +0.02em'),
    h('li', 'Figures: tabular'),
    h('li', [h('strong', 'Accent: --graph-accent')]),
  ])
const t = (value: string) => ({ type: 'text' as const, value })
it('matches independent shipped glyphs, colors, connectors and accessible structure', () => {
  const w = mount(GraphTimeline, { props: { title: 'SHIPPED' }, slots: { default: shipped } })
  expect(w.get('ol').attributes('role')).toBe('list')
  expect(w.findAll('li > div:first-child > span:first-child').map((n) => n.text())).toEqual([
    '●',
    '●',
    '○',
  ])
  expect(w.findAll('li > div:first-child > span:nth-child(2)').map((n) => n.text())).toEqual([
    'Mar 12',
    'Mar 18',
    'Apr 02',
  ])
  expect(w.findAll('li > div:first-child > span:last-child > span').map((n) => n.text())).toEqual([
    'CLI copies the files',
    'Docs, live previews',
    'Registry listed',
  ])
  expect(
    w.findAll('li > div:first-child > span:first-child').map((n) => n.classes().at(-1)),
  ).toEqual(['text-foreground', 'text-graph-accent', 'text-graph-muted'])
  expect(w.findAll('li > div[aria-hidden="true"]')).toHaveLength(2)
  expect(w.findAll('li > div:first-child > span[aria-hidden="true"]')).toHaveLength(3)
  expect(w.attributes('aria-labelledby')).toBe(w.get('figcaption').attributes('id'))
  w.unmount()
})
it('matches independent type labels, values and accent with dl semantics', () => {
  const w = mount(GraphSpec, { props: { title: 'TYPE' }, slots: { default: type } })
  expect(w.findAll('dt').map((n) => n.text())).toEqual([
    'Family',
    'Size',
    'Tracking',
    'Figures',
    'Accent',
  ])
  expect(w.findAll('dd').map((n) => n.text())).toEqual([
    'Geist Mono',
    '14 / 21',
    '+0.02em',
    'tabular',
    '--graph-accent',
  ])
  expect(w.findAll('dd > span').at(-1)?.classes()).toEqual(['tabular-nums', 'text-graph-accent'])
  expect(w.get('dl > div').classes()).toContain('grid-cols-[minmax(0,11rem)_minmax(0,1fr)]')
  w.unmount()
})
it('parses times, dash notes and loose bodies; body and nested signals do not affect head state', () => {
  const nodes = [
    h('ol', [
      h('li', '14:02: p95 crossed 800ms — paged the on-call'),
      h('li', [
        h('p', '14:11: rolled back — discarded'),
        h('p', [h('b', 'Errors stopped'), h('i', 'inside a minute')]),
        h('ul', [h('li', h('strong', 'nested'))]),
      ]),
      h('li', [h('p', [h('i', '14:40: write'), h('b', ' postmortem')])]),
    ]),
  ]
  const model = timelineModel(nodes)
  expect(model.map(({ date, label, state }) => ({ date, label, state }))).toEqual([
    { date: '14:02', label: 'p95 crossed 800ms', state: 'done' },
    { date: '14:11', label: 'rolled back', state: 'done' },
    { date: '14:40', label: 'write postmortem', state: 'now' },
  ])
  expect(model[0]?.note).toBe('paged the on-call')
  const w = mount(GraphTimeline, { props: { title: 'NIGHT' }, slots: { default: () => nodes } })
  expect(w.text()).not.toMatch(/nested|discarded/)
  expect(w.get('li:nth-child(2) p').text()).toBe('Errors stoppedinside a minute')
  w.unmount()
})
it('drops nested rich label prefixes while preserving link attributes and strike hosts', () => {
  const w = mount(GraphSpec, {
    props: { title: 'INSTALL' },
    slots: {
      default: () =>
        h('ul', [
          h('li', [
            h('p', [
              h('b', [
                'Needs: ',
                h(
                  'a',
                  { href: '/guide', title: 'Guide', target: '_blank', rel: 'noreferrer' },
                  'docs',
                ),
              ]),
            ]),
            h('p', [h('strong', 'note')]),
          ]),
          h('li', ['Old: ', h('del', 'removed')]),
          h('li', ['No separator ', h('code', 'code')]),
        ]),
    },
  })
  expect(w.get('a').attributes()).toEqual({
    href: '/guide',
    title: 'Guide',
    target: '_blank',
    rel: 'noreferrer',
  })
  expect(w.get('dd b').text()).toBe('docs')
  expect(w.get('del').text()).toBe('removed')
  expect(w.findAll('dd')[2]?.text()).toBe('No separator code')
  expect(w.get('dd > div').classes()).toContain('[overflow-wrap:anywhere]')
  w.unmount()
})
it('ignores body-only accent and custom wrappers, honors Fragment and list before markers', () => {
  const Opaque = defineComponent({ setup: () => () => type() })
  const w = mount(GraphSpec, {
    props: { title: 'TEST' },
    slots: {
      default: () =>
        h(Fragment, [
          h(Opaque),
          h(Field as Component, { label: 'hidden' }, () => 'hidden'),
          h('ul', [
            h('li', [
              h('p', 'Name: Plain'),
              h('p', h('strong', 'body')),
              h('ul', [h('li', h('b', 'nested'))]),
            ]),
          ]),
        ]),
    },
  })
  expect(w.findAll('dt').map((n) => n.text())).toEqual(['Name'])
  expect(w.get('dd > span').classes()).toContain('text-foreground')
  expect(w.text()).not.toContain('nested')
  w.unmount()
})
it.each([undefined, null, []])('uses events precedence for %j', (events) => {
  const w = mount(GraphTimeline, { props: { title: 'TEST', events }, slots: { default: shipped } })
  expect(w.findAll('li')).toHaveLength(events == null ? 3 : 0)
  w.unmount()
})
it.each([undefined, null, []])('uses rows precedence for %j', (rows) => {
  const w = mount(GraphSpec, { props: { title: 'TEST', rows }, slots: { default: type } })
  expect(w.findAll('dt')).toHaveLength(rows == null ? 5 : 0)
  w.unmount()
})
it('preserves item empty overrides, body note nodes and normalizes boolean attrs', () => {
  const tw = mount(GraphTimeline, {
    props: { title: 'ITEM', palette: 'mono' },
    attrs: { 'class-name': 'custom', 'data-test': 'item', corner: 'x' },
    slots: {
      default: () => [
        h(
          Event,
          { date: '14:02', label: '', note: h('code', 'note'), state: 'now' },
          () => 'ignored',
        ),
        h(Event, { date: '14:11' }, () => 'fallback'),
      ],
    },
  })
  expect(tw.findAll('li > div:first-child > span:last-child > span').map((n) => n.text())).toEqual([
    '',
    'fallback',
  ])
  expect(tw.get('code').text()).toBe('note')
  expect(tw.classes()).toContain('custom')
  expect(tw.attributes('data-test')).toBe('item')
  expect(tw.findAll('figure > span').map((n) => n.text())).toEqual(['x', 'x', 'x', 'x'])
  tw.unmount()
  const sw = mount(GraphSpec, {
    props: { title: 'ITEM' },
    slots: {
      default: () => [
        h(
          Field as Component,
          { label: 'One', value: '', accent: '', note: h('em', 'note') },
          () => 'ignored',
        ),
        h(Field as Component, { label: 'Two', accent: false }, () => 'fallback'),
      ],
    },
  })
  expect(sw.findAll('dd > span').map((n) => n.text())).toEqual(['', 'fallback'])
  expect(sw.get('dd > span').classes()).toContain('text-graph-accent')
  expect(
    childItems([h(Field as Component, { label: 'A', accent: 'accent' })], Field)[0]?.props.accent,
  ).toBe(true)
  expect(sw.get('em').text()).toBe('note')
  sw.unmount()
})
it('uses data before compiler list and preserves missing or empty value strings', () => {
  const tw = mount(GraphTimeline, {
    props: { title: 'T', events: [{ date: 'one' }], list: [] },
    slots: { default: shipped },
  })
  expect(tw.findAll('li')).toHaveLength(1)
  expect(tw.get('li > div:first-child > span:last-child > span').text()).toBe('')
  tw.unmount()
  const sw = mount(GraphSpec, {
    props: { title: 'S', rows: [{ label: 'one' }], list: [] },
    slots: { default: type },
  })
  expect(sw.get('dd').text()).toBe('')
  sw.unmount()
})
it('shares core head/body grammar without signals from notes', () => {
  const item: StateListItem = {
    text: 'unused',
    paragraphs: [],
    strong: true,
    em: true,
    head: [t('14:02: one — inline')],
    body: [[{ type: 'strong', children: [t('body')] }]],
  }
  expect(timelineFromList(item)).toEqual({
    date: '14:02',
    label: 'one',
    state: 'done',
    note: item.body,
  })
  expect(
    specFromList({
      ...item,
      head: [t('Path: '), { type: 'code', children: [t('registry/default')] }],
    }),
  ).toEqual({
    label: 'Path',
    value: 'registry/default',
    accent: false,
    rich: [{ type: 'code', children: [t('registry/default')] }],
    note: item.body,
  })
})
it.each([GraphTimeline, GraphSpec])(
  'reads updated slots including dynamic compiled heads (%s)',
  async (component) => {
    const value = ref('before')
    const w = mount(
      defineComponent({
        components: { Widget: component },
        setup: () => ({ value }),
        template: '<Widget title="LIVE"><ul><li>Label: <code>{{ value }}</code></li></ul></Widget>',
      }),
    )
    expect(w.text()).toContain('before')
    value.value = 'after'
    await nextTick()
    expect(w.text()).toContain('after')
    expect(w.text()).not.toContain('before')
    w.unmount()
  },
)
it.each([GraphTimeline, GraphSpec])(
  'has visible SSR and hydrates without warnings (%s)',
  async (component) => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const app = defineComponent({
      setup: () => () =>
        h(
          component,
          { title: 'Fixture' },
          { default: component === GraphTimeline ? shipped : type },
        ),
    })
    const html = await renderToString(createSSRApp(app))
    expect(html).not.toMatch(/opacity:\s*0|translateY/)
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    const before = host.innerHTML
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const client = createSSRApp(app)
    client.mount(host)
    await nextTick()
    expect(host.innerHTML).toBe(before)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    client.unmount()
    host.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  },
)
