import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { Fragment, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Chat, Keys } from '../src'
import { chatModel } from '../src/adapters/chat'
import { chatFromList, chordsOf } from '../src/core'

const session = () =>
  h('ul', [
    h('li', 'you: which graph shows a rollback?'),
    h('li', 'agent: Timeline. Bold the row where you rolled back.'),
    h('li', ['agent: ', h('em', 'reads graph-timeline.tsx')]),
    h('li', 'agent: Then Diff for what the rollback changed.'),
    h('li', 'you: and on GitHub?'),
    h('li', 'agent: Paste the fenced ASCII. GitHub does not run MDX.'),
  ])
const shortcuts = () =>
  h('ul', [
    h('li', [h('strong', '⌘K: search the docs')]),
    h('li', '⌘⇧C: copy the page as Markdown'),
    h('li', 'Ctrl+Shift+P: command palette'),
    h('li', 'g then d: go to docs'),
    h('li', 'Esc: close'),
  ])
describe('independent Chat and Keys fixtures', () => {
  it('updates a compiled dynamic host head after dropping the speaker prefix', async () => {
    const message = ref('before')
    const w = mount(
      defineComponent({
        components: { Chat },
        setup: () => ({ message }),
        template: '<Chat><ul><li>you: {{ message }}</li></ul></Chat>',
      }),
    )
    expect(w.get('li > div').text()).toBe('before')
    message.value = 'after'
    await nextTick()
    expect(w.get('li > div').text()).toBe('after')
    w.unmount()
  })
  it('renders the upstream session with prompt, repeated speaker and aside semantics', () => {
    const w = mount(Chat, { props: { title: 'SESSION' }, slots: { default: session } })
    expect(w.get('ol').attributes('role')).toBe('list')
    expect(w.findAll('li > span:first-child').map((node) => node.text())).toEqual([
      '>',
      '',
      '',
      '',
      '>',
      '',
    ])
    expect(
      w.findAll('li > span:first-child').every((node) => node.attributes('aria-hidden') === 'true'),
    ).toBe(true)
    expect(w.findAll('li > span:nth-child(2)').map((node) => node.text())).toEqual([
      'you',
      'agent',
      'agent',
      'agent',
      'you',
      'agent',
    ])
    expect(w.findAll('li > span:nth-child(2) .sr-only').map((node) => node.text())).toEqual([
      'agent',
      'agent',
    ])
    expect(w.findAll('li')[2]!.classes()).toContain('mt-1')
    expect(w.findAll('li')[4]!.classes()).toContain('mt-4')
    expect(w.findAll('li > div')[2]!.classes()).toContain('text-graph-muted')
    expect(w.get('em').text()).toBe('reads graph-timeline.tsx')
    expect(w.attributes('aria-labelledby')).toBe(w.get('figcaption').attributes('id'))
    w.unmount()
  })
  it('keeps rich prefix nesting, loose bodies, attributes and excludes nested lists', () => {
    const w = mount(Chat, {
      slots: {
        default: () =>
          h(Fragment, [
            h('ol', [
              h('li', [
                h('p', [
                  h('strong', 'priya: hello '),
                  h('a', { href: '/guide', title: 'Guide' }, 'docs'),
                ]),
                h('p', [h('code', 'pnpm')]),
                h('ul', [h('li', 'nested: hidden')]),
              ]),
              h('li', [h('p', ['jon: ', h('i', 'pause')]), h('p', 'body')]),
              h('li', 'no speaker'),
            ]),
          ]),
      },
    })
    expect(w.findAll('li')).toHaveLength(2)
    expect(w.get('strong').text()).toBe('hello')
    expect(w.get('a').attributes()).toMatchObject({ href: '/guide', title: 'Guide' })
    expect(w.get('code').text()).toBe('pnpm')
    expect(w.findAll('li > div')[1]!.classes()).toContain('text-foreground')
    expect(w.text()).not.toContain('nested')
    w.unmount()
  })
  it('uses case-insensitive asker matching and case-sensitive grouping', () => {
    const w = mount(Chat, {
      props: { you: 'YOU', prompt: '$', palette: 'mono' },
      slots: {
        default: () => h('ul', [h('li', 'you: one'), h('li', 'You: two'), h('li', 'You: three')]),
      },
    })
    expect(w.findAll('li > span:first-child').map((node) => node.text())).toEqual(['$', '$', ''])
    expect(w.findAll('li > span:first-child')[0]!.classes()).toContain('text-graph-accent')
    w.unmount()
  })
  it('recognizes only a lone top-level italic turn as an aside', () => {
    const turns = chatModel([
      h('ul', [
        h('li', ['a: ', h('i', 'pause')]),
        h('li', ['a: ', h('em', 'pause'), ' text']),
        h('li', ['a: ', h('strong', [h('em', 'pause')])]),
      ]),
    ])
    expect(turns.map((turn) => turn.aside)).toEqual([true, false, false])
  })
  it.each(['', 'a'.repeat(24), 'a'.repeat(25), 'a\nb'])(
    'validates speaker prefix %j',
    (speaker) => {
      expect(
        chatFromList({ head: [{ type: 'text', value: `${speaker}: hello` }], body: [] }),
      ).toHaveLength(speaker.length === 24 ? 1 : 0)
    },
  )
  it.each([undefined, null, []])('respects turns precedence for %j', (turns) => {
    const w = mount(Chat, { props: { turns }, slots: { default: session } })
    expect(w.findAll('li')).toHaveLength(turns == null ? 6 : 0)
    w.unmount()
  })
  it('prefers typed turns over compiler input and slot, including an empty asker', () => {
    const w = mount(Chat, {
      props: {
        you: '',
        turns: [{ by: 'Data', children: h('a', { href: '/data' }, 'Data'), aside: true }],
        list: [],
      },
      slots: { default: session },
    })
    expect(w.findAll('li')).toHaveLength(1)
    expect(w.get('li > span:first-child').text()).toBe('')
    expect(w.get('a').attributes('href')).toBe('/data')
    expect(w.get('li > div').classes()).toContain('text-graph-muted')
    w.unmount()
  })
  it('renders upstream shortcut chords, descriptions, accent and accessible text', () => {
    const w = mount(Keys, { props: { title: 'SHORTCUTS' }, slots: { default: shortcuts } })
    expect(w.get('dl').classes()).toEqual(['flex', 'flex-col', 'gap-3'])
    expect(w.findAll('dt > .sr-only').map((node) => node.text())).toEqual([
      '⌘K',
      '⌘⇧C',
      'Ctrl+Shift+P',
      'g then d',
      'Esc',
    ])
    expect(w.findAll('dd').map((node) => node.text())).toEqual([
      'search the docs',
      'copy the page as Markdown',
      'command palette',
      'go to docs',
      'close',
    ])
    expect(
      w
        .findAll('dt')[0]!
        .findAll('.whitespace-nowrap')
        .map((node) => node.text()),
    ).toEqual(['[⌘]', '[K]'])
    expect(
      w
        .findAll('dt')[2]!
        .findAll('.whitespace-nowrap')
        .map((node) => node.text()),
    ).toEqual(['[Ctrl]', '[Shift]', '[P]'])
    expect(
      w
        .findAll('dt')[3]!
        .findAll('[aria-hidden="true"]')
        .map((node) => node.text()),
    ).toEqual(['[g]', 'then[d]'])
    expect(w.findAll('dd')[0]!.classes()).toEqual(['text-graph-accent'])
    w.unmount()
  })
  it.each([
    ['⌘⇧P', [['⌘', '⇧', 'P']]],
    ['⌘⌥', [['⌘', '⌥']]],
    ['Ctrl + Shift + P', [['Ctrl', 'Shift', 'P']]],
    ['g THEN d', [['g'], ['d']]],
    ['', []],
    ['  +  ', []],
    ['⌘Space', [['⌘', 'Space']]],
    ['😀', [['😀']]],
  ] as const)('splits chords %j', (input, expected) => expect(chordsOf(input)).toEqual(expected))
  it.each([undefined, null, []])('respects bindings precedence for %j', (bindings) => {
    const w = mount(Keys, { props: { bindings }, slots: { default: shortcuts } })
    expect(w.findAll('dd')).toHaveLength(bindings == null ? 5 : 0)
    w.unmount()
  })
  it('keeps empty binding fields and accepts frame attrs and kebab-case className', () => {
    const w = mount(Keys, {
      props: { bindings: [{ keys: '', action: '', accent: true }], palette: 'mono' },
      attrs: { 'class-name': 'custom', 'data-test': 'keys', corner: 'x' },
      slots: { default: shortcuts },
    })
    expect(w.findAll('dd')).toHaveLength(1)
    expect(w.get('dt > .sr-only').text()).toBe('')
    expect(w.get('dd').text()).toBe('')
    expect(w.classes()).toContain('custom')
    expect(w.attributes('data-test')).toBe('keys')
    expect(w.get('dd').classes()).toEqual(['text-graph-accent'])
    w.unmount()
  })
  it.each([Chat, Keys])('reads updated slots on every render (%s)', async (component) => {
    const value = ref('before')
    const w = mount(
      defineComponent({
        setup: () => () =>
          h(component, null, { default: () => h('ul', [h('li', `a: ${value.value}`)]) }),
      }),
    )
    expect(w.text()).toContain('before')
    value.value = 'after'
    await nextTick()
    expect(w.text()).toContain('after')
    expect(w.text()).not.toContain('before')
    w.unmount()
  })
  it.each([Chat, Keys])('has visible SSR and hydrates without mismatch (%s)', async (component) => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const slot = component === Chat ? session : shortcuts
    const app = defineComponent({
      setup: () => () => h(component, { title: 'Fixture' }, { default: slot }),
    })
    const html = await renderToString(createSSRApp(app))
    expect(html).not.toMatch(/opacity:\s*0|translateY/)
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    const before = host.innerHTML
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
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
  })
})
