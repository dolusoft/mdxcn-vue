import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Fragment, createSSRApp, defineComponent, h, nextTick } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Steps, Step, Changelog, Change, Decision } from '../src'
import { stateList } from '../src/adapters/state-list'
import { stepFromList, changeFromList, optionFromList } from '../src/core'
import './fixtures/StateListTypes.vue'

// Handwritten from the upstream install, release, and database examples.
const install = () =>
  h('ol', [
    h('li', [
      h('p', 'Copy the source'),
      h('p', 'Run the shadcn CLI. Files land under registry/default.'),
    ]),
    h('li', [
      h('p', [h('strong', 'Register it')]),
      h('p', 'Export the component from mdx-components.tsx.'),
    ]),
    h('li', [h('p', [h('em', 'Write')]), h('p', 'Use it between paragraphs. No import line.')]),
  ])
const release = () =>
  h('ul', [
    h('li', 'added: Callout, Quote, Steps, Terminal, Changelog'),
    h('li', 'changed: Graphs read MDX children as well as arrays'),
    h('li', 'fixed: Timeline connector on Safari'),
    h('li', 'removed: The legacy accent prop'),
  ])
const database = () => [
  h('ul', [
    h('li', [h('strong', 'Postgres'), ' — boring, and we already run it']),
    h('li', [h('em', 'Mongo'), ' — no joins we trust']),
    h('li', 'SQLite — fine until the second writer'),
  ]),
  h('p', ['Revisit if writes pass ', h('code', '2k'), ' a second.']),
]

describe('independent state-list fixtures', () => {
  it('renders loose install steps with exact classes, numbers, connectors, and bodies', () => {
    const w = mount(Steps, { props: { title: 'INSTALL' }, slots: { default: install } })
    expect(w.get('ol').attributes('role')).toBe('list')
    expect(w.findAll('li > div:first-child > span').map((n) => n.text())).toEqual([
      '01',
      '02',
      '03',
    ])
    expect(
      w.findAll('li > div:first-child > span').map((n) => n.attributes('aria-hidden')),
    ).toEqual(['true', 'true', 'true'])
    expect(
      w.findAll('li > div:first-child > div > p').map((n) => [n.text(), n.attributes('class')]),
    ).toEqual([
      ['Copy the source', 'text-pretty text-foreground'],
      ['Register it', 'text-pretty text-graph-accent'],
      ['Write', 'text-pretty text-graph-muted'],
    ])
    expect(w.findAll('li > div:first-child > div > div > p').map((n) => n.text())).toEqual([
      'Run the shadcn CLI. Files land under registry/default.',
      'Export the component from mdx-components.tsx.',
      'Use it between paragraphs. No import line.',
    ])
    expect(
      w.findAll('li > div:nth-child(2)').map((n) => [n.text(), n.attributes('aria-hidden')]),
    ).toEqual([
      ['│', 'true'],
      ['│', 'true'],
    ])
    expect(w.attributes('aria-labelledby')).toBe(w.get('figcaption').attributes('id'))
    w.unmount()
  })
  it('renders tight runbook splitting dashes without inventing a paragraph body', () => {
    const w = mount(Steps, {
      slots: {
        default: () => h('ol', [h('li', 'Flip the flag — cache.v2 to off in the dashboard.')]),
      },
    })
    expect(w.get('li p').text()).toBe('Flip the flag')
    expect(w.get('li > div > div > div').text()).toBe('cache.v2 to off in the dashboard.')
    expect(w.find('li > div > div > div p').exists()).toBe(false)
    w.unmount()
  })
  it('normalizes Step marker props, fragments and defaults while keeping rich bodies', () => {
    const w = mount(Steps, {
      slots: {
        default: () =>
          h(Fragment, [
            h(Step, { title: 'Install' }, () =>
              h('p', [h('a', { href: '/guide' }, 'Read'), ' ', h('code', 'pnpm')]),
            ),
            h(Step, { title: 'Register', state: 'now' }),
            h(Step, { state: 'next' }),
          ]),
      },
    })
    expect(w.findAll('li').length).toBe(3)
    expect(w.get('a').attributes('href')).toBe('/guide')
    expect(w.get('code').text()).toBe('pnpm')
    expect(w.findAll('li > div:first-child > span').map((n) => n.attributes('class'))).toEqual([
      'tabular-nums select-none text-graph-muted',
      'tabular-nums select-none text-graph-accent',
      'tabular-nums select-none text-graph-frame',
    ])
    expect(w.findAll('li')[2]!.find('p').exists()).toBe(false)
    w.unmount()
  })
  it.each([Steps, Changelog])(
    'prefers a nonempty list over markers and falls back for an empty list (%s)',
    (component) => {
      const marker = component === Steps ? Step : Change
      const w = mount(component, {
        props: { version: '1' },
        slots: {
          default: () => [
            h(marker, { title: 'Marker' }, () => 'Marker'),
            h('ul', [h('li', 'Listed')]),
          ],
        },
      })
      expect(w.findAll('li').length).toBe(1)
      expect(w.text()).toContain('Listed')
      expect(w.text()).not.toContain('Marker')
      w.unmount()
      const empty = mount(component, {
        props: { version: '1' },
        slots: { default: () => [h('ul'), h(marker, { title: 'Marker' }, () => 'Marker')] },
      })
      expect(empty.findAll('li').length).toBe(1)
      expect(empty.text()).toContain('Marker')
      empty.unmount()
    },
  )
  it('renders release labels, responsive grid, header and removal tone', () => {
    const w = mount(Changelog, {
      props: { version: '1.2.0', date: 'Mar 12' },
      slots: { default: release },
    })
    expect(w.get('figcaption').text()).toBe('[ 1.2.0 ]')
    expect(w.get('ul').attributes('role')).toBe('list')
    expect(w.findAll('li > span:first-child').map((n) => n.text())).toEqual(['+', '~', '*', '-'])
    expect(w.findAll('li > span:nth-child(2)').map((n) => n.text())).toEqual([
      'added',
      'changed',
      'fixed',
      'removed',
    ])
    expect(w.findAll('li > div').map((n) => n.text())).toEqual([
      'Callout, Quote, Steps, Terminal, Changelog',
      'Graphs read MDX children as well as arrays',
      'Timeline connector on Safari',
      'The legacy accent prop',
    ])
    expect(w.get('li').attributes('class')).toBe(
      'grid grid-cols-[1.25rem_5.5rem_minmax(0,1fr)] items-baseline gap-x-3 max-sm:grid-cols-[1.25rem_minmax(0,1fr)]',
    )
    expect(w.findAll('li > div')[3]!.classes()).toContain('text-graph-muted')
    expect(w.get('.graph-rule').attributes('aria-hidden')).toBe('true')
    w.unmount()
  })
  it('uses nullish title precedence and conditional version row', () => {
    const titled = mount(Changelog, { props: { version: '0.9.0', title: 'CHANGELOG' } })
    expect(titled.get('figcaption').text()).toBe('[ CHANGELOG ]')
    expect(titled.get('figure > div > div > span').text()).toBe('0.9.0')
    titled.unmount()
    const empty = mount(Changelog, { props: { version: '1', title: '' } })
    expect(empty.find('figcaption').exists()).toBe(false)
    expect(empty.find('.graph-rule').exists()).toBe(false)
    empty.unmount()
  })
  it('retains rich Change item bodies while upstream list bodies remain plain text', () => {
    const marker = mount(Changelog, {
      props: { version: '1', palette: 'mono' },
      slots: { default: () => h(Change, { type: 'add' }, () => h('strong', 'Rich')) },
    })
    expect(marker.get('strong').text()).toBe('Rich')
    expect(marker.get('li > span').classes()).toContain('text-graph-accent')
    marker.unmount()
    const list = mount(Changelog, {
      props: { version: '1' },
      slots: { default: () => h('ul', [h('li', ['fixed: ', h('strong', 'Plain')])]) },
    })
    expect(list.find('strong').exists()).toBe(false)
    expect(list.get('li > div').text()).toBe('Plain')
    list.unmount()
  })
  it('renders database states, reasons, rich after prose and chosen summary', () => {
    const w = mount(Decision, {
      props: { title: 'DATABASE', status: 'accepted', date: 'Mar 12' },
      slots: { default: database },
    })
    expect(w.findAll('li > span:first-child').map((n) => n.text())).toEqual(['●', '×', '○'])
    expect(w.findAll('li > span:nth-child(2)').map((n) => n.text())).toEqual([
      'Postgres',
      'Mongo',
      'SQLite',
    ])
    expect(w.findAll('li > span:nth-child(3)').map((n) => n.text())).toEqual([
      'boring, and we already run it',
      'no joins we trust',
      'fine until the second writer',
    ])
    expect(w.get('.sr-only').text()).toBe('Chose Postgres over 2 other options.')
    expect(w.get('p code').text()).toBe('2k')
    expect(w.findAll('.graph-rule').length).toBe(2)
    expect(w.get('li').attributes('class')).toBe(
      'grid grid-cols-[1.25rem_minmax(0,11rem)_minmax(0,1fr)] items-baseline gap-x-3 max-sm:grid-cols-[1.25rem_minmax(0,1fr)]',
    )
    w.unmount()
  })
  it.each([undefined, null, []])(
    'handles options precedence %j without suppressing after prose',
    (options) => {
      const w = mount(Decision, { props: { options }, slots: { default: database } })
      expect(w.findAll('li').length).toBe(options ? 0 : 3)
      expect(w.get('p').text()).toBe('Revisit if writes pass 2k a second.')
      expect(w.find('.sr-only').exists()).toBe(!options)
      w.unmount()
    },
  )
  it('defaults open data options and chooses only the first chosen summary', () => {
    const w = mount(Decision, {
      props: {
        options: [{ label: 'A' }, { label: 'B', state: 'chosen' }, { label: 'C', state: 'chosen' }],
        corner: '*',
        className: 'custom',
      },
      attrs: { class: 'host', 'data-case': 'data' },
    })
    expect(w.get('figcaption').text()).toBe('[ decision ]')
    expect(w.get('li > span').text()).toBe('○')
    expect(w.get('.sr-only').text()).toBe('Chose B over 2 other options.')
    expect(w.classes()).toContain('custom')
    expect(w.classes()).toContain('host')
    expect(w.attributes('data-case')).toBe('data')
    expect(w.findAll('figure > span').map((n) => n.text())).toEqual(['*', '*', '*', '*'])
    w.unmount()
  })
  it('shares list traversal, ignores nested list text and custom wrappers, and prioritizes strong', () => {
    const Opaque = defineComponent({ setup: () => () => h('ul', [h('li', 'Hidden')]) })
    const list = stateList([
      h(Fragment, [
        h('li', 'Ignored'),
        h('ul', [h('li', ['A — B', h('ul', [h('li', [h('em', 'Nested'), h('b', 'Signal')])])])]),
        h(Opaque),
      ]),
    ])
    expect(list.map((i) => i.description)).toEqual([
      {
        text: 'A — B',
        paragraphs: [],
        strong: true,
        em: true,
        head: [{ type: 'text', value: 'A — B' }],
        body: [],
      },
    ])
    expect(stepFromList(list[0]!.description)).toEqual({ title: 'A', body: 'B', state: 'now' })
    expect(optionFromList(list[0]!.description)).toEqual({
      label: 'A',
      reason: 'B',
      state: 'chosen',
    })
  })
  it.each([
    ['ADD', 'add'],
    ['added', 'add'],
    ['+', 'add'],
    ['changed', 'change'],
    ['~', 'change'],
    ['fix', 'fix'],
    ['fixed', 'fix'],
    ['*', 'fix'],
    ['removed', 'remove'],
    ['-', 'remove'],
    ['unknown', 'change'],
  ] as const)('parses change token %s with independent expected type %s', (token, type) => {
    expect(
      changeFromList({ text: `${token}: body`, paragraphs: [], strong: false, em: false }),
    ).toEqual({ type, body: 'body' })
  })
  it('keeps unknown unsplit change text and loose single-paragraph titles', () => {
    expect(changeFromList({ text: 'added:', paragraphs: [], strong: false, em: false })).toEqual({
      type: 'change',
      body: 'added:',
    })
    expect(
      stepFromList({
        text: 'A — B',
        paragraphs: [[{ type: 'text', value: 'A — B' }]],
        strong: false,
        em: false,
      }),
    ).toEqual({ title: 'A — B', body: undefined, state: 'done' })
  })
  it.each([
    [Steps, { title: 'INSTALL' }, install],
    [Changelog, { version: '1.2.0' }, release],
    [Decision, { title: 'DATABASE' }, database],
  ] as const)(
    'SSR is visible and hydrates unchanged without IntersectionObserver (%s)',
    async (component, props, children) => {
      vi.stubGlobal('IntersectionObserver', undefined)
      const Root = defineComponent({
        setup: () => () => h(component as Component, props, children),
      })
      const html = await renderToString(createSSRApp(Root))
      expect(html).not.toMatch(/opacity:\s*0|translateY/)
      const target = document.createElement('div')
      target.innerHTML = html
      document.body.append(target)
      const before = target.innerHTML
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const app = createSSRApp(Root)
      try {
        app.mount(target)
        await nextTick()
        expect(target.innerHTML).toBe(before)
        expect(warn).not.toHaveBeenCalled()
        expect(error).not.toHaveBeenCalled()
      } finally {
        app.unmount()
        target.remove()
        warn.mockRestore()
        error.mockRestore()
        vi.unstubAllGlobals()
      }
    },
  )
  it.each([
    [Steps, { title: 'LONG' }, Step, 'title', 300],
    [Changelog, { version: '1' }, Change, 'type', 250],
    [
      Decision,
      { options: Array.from({ length: 60 }, (_, i) => ({ label: String(i) })) },
      null,
      '',
      250,
    ],
  ] as const)(
    'caps long-list reveal delays even when the last row enters alone (%s)',
    async (component, props, marker, field, delay) => {
      const observers: { callback: IntersectionObserverCallback; target?: Element }[] = []
      const animate = vi.fn((frames: unknown, options: unknown) => {
        void frames
        void options
        return { finished: Promise.resolve(), cancel: vi.fn() }
      })
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          record: { callback: IntersectionObserverCallback; target?: Element }
          constructor(callback: IntersectionObserverCallback) {
            this.record = { callback }
            observers.push(this.record)
          }
          observe(target: Element) {
            this.record.target = target
          }
          unobserve() {}
          disconnect() {}
        },
      )
      vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      }))
      const original = Element.prototype.animate
      Element.prototype.animate = animate as unknown as typeof original
      const w = mount(component as Component, {
        props: props as Record<string, unknown>,
        slots: marker
          ? {
              default: () =>
                Array.from({ length: 60 }, (_, i) =>
                  h(marker, { [field]: field === 'type' ? 'add' : String(i) }),
                ),
            }
          : {},
      })
      try {
        const last = w.findAll('li').at(-1)!.element
        observers
          .find((observer) => observer.target === last)!
          .callback(
            [{ target: last, isIntersecting: true }] as unknown as IntersectionObserverEntry[],
            {} as IntersectionObserver,
          )
        await nextTick()
        expect(animate).toHaveBeenCalled()
        expect(animate).toHaveBeenCalledTimes(1)
        expect(animate.mock.calls.at(-1)![1]).toMatchObject({ delay })
        expect((last as HTMLElement).style.opacity).toBe('')
      } finally {
        w.unmount()
        Element.prototype.animate = original
        vi.unstubAllGlobals()
      }
    },
  )
})
