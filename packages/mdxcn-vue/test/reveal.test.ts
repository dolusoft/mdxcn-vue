import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, withDirectives } from 'vue'
import { vReveal } from '../src/directives/reveal'
import type { Component } from 'vue'
import type { RevealOptions } from '../src/directives/reveal'
import { Annotate } from '../src/components/annotate'
import { Env } from '../src/components/env'
import { Chat, Keys, GraphTimeline, GraphSpec } from '../src'
import { Terminal } from '../src/components/terminal'

let reduced: boolean
let onChange: (() => void) | undefined
let callback: IntersectionObserverCallback
let config: IntersectionObserverInit | undefined
let observer: IntersectionObserver
const disconnect = vi.fn()
const observe = vi.fn()
const removeListener = vi.fn()
const cancel = vi.fn()
let animation: Animation
const animate = vi.fn()
let wrappers: ReturnType<typeof mount>[]

function render(options: RevealOptions = {}, style = '') {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        withDirectives(h('div', { style }, 'visible content'), [[vReveal, options]]),
    }),
  )
  wrappers.push(wrapper)
  return wrapper
}

function intersect() {
  callback(
    [{ isIntersecting: true, intersectionRatio: 0.001 } as IntersectionObserverEntry],
    observer,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  reduced = false
  onChange = undefined
  wrappers = []
  animation = { cancel, onfinish: null } as unknown as Animation
  animate.mockReturnValue(animation)
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        callback = cb
        config = options
        observer = this as unknown as IntersectionObserver
      }
      observe = observe
      disconnect = disconnect
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      get matches() {
        return reduced
      },
      addEventListener: (_: string, listener: () => void) => {
        onChange = listener
      },
      removeEventListener: removeListener,
    })),
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 2000,
    bottom: 2020,
    left: 0,
    right: 100,
    width: 100,
    height: 20,
    x: 0,
    y: 2000,
    toJSON: () => ({}),
  })
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate })
})

afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(HTMLElement.prototype, 'animate')
})

describe('v-reveal lifecycle', () => {
  it.each([
    {
      component: Chat,
      props: { turns: Array.from({ length: 60 }, () => ({ by: 'you', children: 'hello' })) },
      cap: 300,
      selector: 'li',
    },
    {
      component: GraphTimeline,
      props: {
        title: 'T',
        events: Array.from({ length: 60 }, () => ({ date: 'one', label: 'event' })),
      },
      cap: 250,
      selector: 'li',
    },
    {
      component: GraphSpec,
      props: {
        title: 'S',
        rows: Array.from({ length: 60 }, () => ({ label: 'one', value: 'value' })),
      },
      cap: 200,
      selector: 'dl > div',
    },
    {
      component: Keys,
      props: { bindings: Array.from({ length: 60 }, () => ({ keys: 'K', action: 'search' })) },
      cap: 200,
      selector: 'dl > div',
    },
  ])(
    'caps $component.name stagger at $cap ms for the last of 60 rows',
    ({ component, props, cap, selector }) => {
      const wrapper = mount(
        defineComponent({ setup: () => () => h(component as Component, props) }),
      )
      wrappers.push(wrapper)
      expect(observe).toHaveBeenCalledTimes(60)
      intersect()
      expect(animate.mock.calls[0]?.[1].delay).toBe(cap)
      expect((wrapper.findAll(selector).at(-1)?.element as HTMLElement).style.opacity).toBe('')
      expect(animate).toHaveBeenCalledTimes(1)
    },
  )
  it('caps Annotate stagger at 250 ms when the last of 60 notes enters alone', () => {
    const wrapper = mount(Annotate, { props: { notes: Array(60).fill('note') } })
    wrappers.push(wrapper)
    expect(observe).toHaveBeenCalledTimes(61)
    intersect()
    expect(animate.mock.calls[0]?.[1].delay).toBe(250)
    expect(wrapper.findAll('li').at(-1)?.element.style.opacity).toBe('')
    expect(animate).toHaveBeenCalledTimes(1)
  })
  it('caps Env stagger at 200 ms when the last of 60 variables enters alone', () => {
    const wrapper = mount(Env, {
      props: {
        vars: Array.from({ length: 60 }, (_, index) => ({ name: `KEY_${index}`, value: 'value' })),
      },
    })
    wrappers.push(wrapper)
    expect(observe).toHaveBeenCalledTimes(60)
    intersect()
    expect(animate.mock.calls[0]?.[1].delay).toBe(200)
    expect(wrapper.findAll('li').at(-1)?.element.style.opacity).toBe('')
    expect(animate).toHaveBeenCalledTimes(1)
  })
  it('caps Terminal stagger at 200 ms even when the last of 60 lines enters alone', () => {
    const wrapper = mount(Terminal, { props: { text: Array(60).fill('output').join('\n') } })
    wrappers.push(wrapper)
    expect(observe).toHaveBeenCalledTimes(60)
    intersect()
    expect(animate.mock.calls[0]?.[1].delay).toBe(200)
    expect(wrapper.findAll('code').at(-1)?.element.style.opacity).toBe('')
    expect(animate).toHaveBeenCalledTimes(1)
  })
  it('observes before hiding with threshold zero and rootMargin', () => {
    observe.mockImplementationOnce((element: HTMLElement) => expect(element.style.opacity).toBe(''))
    const wrapper = render({ rootMargin: '0px' })
    expect(config).toEqual({ threshold: 0, rootMargin: '0px' })
    expect(wrapper.element.style.opacity).toBe('0')
    expect(wrapper.element.style.transform).toBe('translateY(8px)')
  })
  it('animates once at tiny intersection ratios with target opacity and stagger', () => {
    const wrapper = render({ opacity: 0.4, delay: 150 }, 'transform: scale(2)')
    intersect()
    expect(animate).toHaveBeenCalledWith(
      [
        { opacity: 0, transform: 'scale(2) translateY(8px)' },
        { opacity: '0.4', transform: 'scale(2)' },
      ],
      { duration: 220, easing: 'cubic-bezier(.215,.61,.355,1)', delay: 150, fill: 'backwards' },
    )
    expect(wrapper.element.style.opacity).toBe('0.4')
    expect(wrapper.element.style.transform).toBe('scale(2)')
    intersect()
    expect(animate).toHaveBeenCalledTimes(1)
  })
  it('preserves existing computed opacity without an explicit target', () => {
    const wrapper = render({}, 'opacity: 0.4')
    intersect()
    expect(animate.mock.calls[0]?.[0][1].opacity).toBe('0.4')
    expect(wrapper.element.style.opacity).toBe('0.4')
  })
  it('leaves initial viewport content visible during hydration', () => {
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue({
      top: 10,
      bottom: 30,
      left: 0,
      right: 100,
    } as DOMRect)
    const wrapper = render()
    expect(wrapper.element.style.opacity).toBe('')
    expect(observe).not.toHaveBeenCalled()
    expect(animate).not.toHaveBeenCalled()
  })
  it('leaves content visible when reduced motion is initially enabled', () => {
    reduced = true
    const wrapper = render()
    expect(wrapper.element.style.opacity).toBe('')
    expect(observe).not.toHaveBeenCalled()
  })
  it('opens pending content when motion preference changes', () => {
    const wrapper = render()
    reduced = true
    onChange?.()
    expect(wrapper.element.style.opacity).toBe('')
    expect(wrapper.element.style.transform).toBe('')
    intersect()
    expect(animate).not.toHaveBeenCalled()
    expect(disconnect).toHaveBeenCalled()
  })
  it('rechecks reduced motion immediately before starting animation', () => {
    const wrapper = render()
    reduced = true
    intersect()
    expect(wrapper.element.style.opacity).toBe('')
    expect(animate).not.toHaveBeenCalled()
  })
  it('cancels active WAAPI on preference change', () => {
    render()
    intersect()
    reduced = true
    onChange?.()
    expect(cancel).toHaveBeenCalledTimes(1)
  })
  it('cleans observer, media listener and active animation on unmount', () => {
    const wrapper = render()
    intersect()
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
    expect(removeListener).toHaveBeenCalledWith('change', onChange)
    expect(cancel).toHaveBeenCalledTimes(1)
  })
  it('releases completed animations', () => {
    render()
    intersect()
    animation.onfinish?.call(animation, {} as AnimationPlaybackEvent)
    expect(cancel).toHaveBeenCalledTimes(1)
  })
  it('leaves content visible when observation fails', () => {
    observe.mockImplementationOnce(() => {
      throw new Error('observer failed')
    })
    const wrapper = render()
    expect(wrapper.element.style.opacity).toBe('')
    expect(wrapper.element.style.transform).toBe('')
    expect(disconnect).toHaveBeenCalled()
  })
  it('leaves content visible when animation fails', () => {
    animate.mockImplementationOnce(() => {
      throw new Error('animation failed')
    })
    const wrapper = render()
    intersect()
    expect(wrapper.element.style.opacity).toBe('')
    expect(wrapper.element.style.transform).toBe('')
  })
  it.each(['observer', 'animate', 'matchMedia'])(
    'leaves content visible without %s support',
    (feature) => {
      if (feature === 'observer') vi.stubGlobal('IntersectionObserver', undefined)
      if (feature === 'animate') Reflect.deleteProperty(HTMLElement.prototype, 'animate')
      if (feature === 'matchMedia') vi.stubGlobal('matchMedia', undefined)
      const wrapper = render()
      expect(wrapper.element.style.opacity).toBe('')
      expect(observe).not.toHaveBeenCalled()
    },
  )
})
