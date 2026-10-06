import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GraphTimer, formatAgo, formatClock, formatHms, parseInstant, useGraphNow } from '../src'

const instant = Date.UTC(2026, 0, 2, 12, 34, 56)
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(instant)
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('clock helpers', () => {
  it('parses Date, milliseconds and ISO strings and rejects invalid instants', () => {
    for (const value of [new Date(instant), instant, '2026-01-02T12:34:56Z'])
      expect(parseInstant(value)).toBe(instant)
    for (const value of ['bad', Infinity, new Date(NaN)]) expect(parseInstant(value)).toBeNaN()
  })
  it.each([
    [0, '00:00:00'],
    [-1000, '00:00:00'],
    [999, '00:00:00'],
    [3661000, '01:01:01'],
    [90061000, '1d 01:01:01'],
  ])('formats elapsed %s ms', (value, expected) =>
    expect(formatHms(value as number)).toBe(expected),
  )
  it.each([
    [59000, '59s ago'],
    [60000, '1m ago'],
    [3600000, '1h ago'],
    [47 * 3600000, '47h ago'],
    [48 * 3600000, '2d ago'],
    [-1, '0s ago'],
  ])('formats ago %s ms', (value, expected) => expect(formatAgo(value as number)).toBe(expected))
  it('formats local time with a fixed UTC test timezone', () => {
    expect(new Date(instant).getTimezoneOffset()).toBe(0)
    expect(formatClock(instant)).toBe('12:34:56')
  })
})
describe('GraphTimer', () => {
  it.each(['elapsed', 'ago', 'clock'] as const)(
    'SSR equals the first client render for %s then updates after mount',
    async (kind) => {
      const render = () =>
        h(GraphTimer, { title: 'TIMER', kind, at: instant - 65000, caption: 'caption' })
      const container = document.createElement('div')
      container.innerHTML = await renderToString(createSSRApp({ render }))
      const before = container.innerHTML
      expect(vi.getTimerCount()).toBe(0)
      expect(before).toContain(kind === 'ago' ? '0s ago' : '00:00:00')
      expect(before).not.toMatch(/opacity:\s*0(?:;|")|translateY/)
      const warn = vi.spyOn(console, 'warn')
      const error = vi.spyOn(console, 'error')
      vi.setSystemTime(instant + 5000)
      const app = createSSRApp({ render })
      app.mount(container)
      expect(container.innerHTML).toBe(before)
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
      await nextTick()
      expect(container.querySelector('.tabular-nums')?.textContent).toBe(
        kind === 'clock' ? '12:35:01' : kind === 'ago' ? '1m ago' : '00:01:10',
      )
      app.unmount()
      expect(vi.getTimerCount()).toBe(0)
    },
  )
  it('ticks every second and clears the timer on unmount', async () => {
    const wrapper = mount(GraphTimer, { props: { title: 'elapsed', at: instant } })
    await nextTick()
    expect(vi.getTimerCount()).toBe(1)
    await vi.advanceTimersByTimeAsync(2200)
    expect(wrapper.get('.tabular-nums').text()).toBe('00:00:02')
    expect(wrapper.get('.sr-only').text()).toBe('elapsed 00:00:02')
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
    await vi.advanceTimersByTimeAsync(5000)
    expect(vi.getTimerCount()).toBe(0)
  })
  it('uses a custom composable interval and readonly time', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const now = useGraphNow(250)
          return () => h('p', String(now.value))
        },
      }),
    )
    await nextTick()
    expect(wrapper.text()).toBe(String(instant))
    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.text()).toBe(String(instant + 250))
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('reads normalized Markdown instant and caption and gives props independent precedence', async () => {
    const wrapper = mount(GraphTimer, {
      props: { title: 'written' },
      slots: { default: () => h('p', '\n 2026-01-02T12:34:00Z — since\n deploy ') },
    })
    await nextTick()
    expect(wrapper.get('.tabular-nums').text()).toBe('00:00:56')
    expect(wrapper.get('.text-graph-muted').text()).toBe('since deploy')
    await wrapper.setProps({ at: instant - 2000, caption: '' })
    expect(wrapper.get('.tabular-nums').text()).toBe('00:00:02')
    expect(wrapper.find('.text-graph-muted').exists()).toBe(false)
    await wrapper.setProps({ at: null, caption: null })
    expect(wrapper.get('.tabular-nums').text()).toBe('00:00:56')
    expect(wrapper.get('.text-graph-muted').text()).toBe('since deploy')
    wrapper.unmount()
  })
  it.each([undefined, 'bad', Infinity])(
    'keeps the upstream placeholder for invalid origin %s',
    async (at) => {
      const wrapper = mount(GraphTimer, { props: { title: 'invalid', at, kind: 'ago' } })
      await nextTick()
      expect(wrapper.get('.tabular-nums').text()).toBe('0s ago')
      expect(wrapper.get('.sr-only').text()).toBe('timer')
      wrapper.unmount()
    },
  )
  it('clamps future instants and responds to kind changes', async () => {
    const wrapper = mount(GraphTimer, { props: { title: 'future', at: instant + 100000 } })
    await nextTick()
    expect(wrapper.get('.tabular-nums').text()).toBe('00:00:00')
    await wrapper.setProps({ kind: 'clock' })
    expect(wrapper.get('.tabular-nums').text()).toBe('12:34:56')
    expect(wrapper.get('.sr-only').text()).toBe('local time 12:34:56')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.get('.tabular-nums').text()).toBe('12:34:57')
    wrapper.unmount()
  })
})
