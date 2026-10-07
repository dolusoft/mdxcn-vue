import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, Fragment, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Footnotes } from '../src'

const notes = () => [
  h('h2', { id: 'footnote-label', class: 'sr-only' }, 'End Notes'),
  h('ol', [
    h('li', { id: 'fn-1' }, [
      h('p', [h('strong', 'Note'), ' ', h('a', { href: '#fnref-1' }, 'Back')]),
    ]),
  ]),
]
it('preserves hidden heading IDs, numbered note IDs, rich text and backlinks', () => {
  const wrapper = mount(Footnotes, {
    attrs: { class: 'host', 'data-test': 'notes' },
    slots: { default: () => h(Fragment, notes()) },
  })
  expect(wrapper.find('figcaption').text()).toContain('end notes')
  expect(wrapper.find('h2').attributes('id')).toBe('footnote-label')
  expect(wrapper.find('h2').classes()).toContain('sr-only')
  expect(wrapper.find('li').attributes('id')).toBe('fn-1')
  expect(wrapper.find('li > span[aria-hidden]').text()).toBe('01')
  expect(wrapper.find('li strong').text()).toBe('Note')
  expect(wrapper.find('li a').attributes('href')).toBe('#fnref-1')
  expect(wrapper.classes()).toContain('host')
  expect(wrapper.attributes('data-test')).toBe('notes')
})
it('supports the VitePress section wrapper and retains its host attributes', () => {
  const wrapper = mount(Footnotes, {
    slots: {
      default: () => [
        h('hr'),
        h(
          'section',
          { class: 'footnotes', id: 'notes', 'aria-labelledby': 'footnote-label' },
          notes(),
        ),
      ],
    },
  })
  expect(wrapper.find('section').attributes('id')).toBe('notes')
  expect(wrapper.find('section').attributes('aria-labelledby')).toBe('footnote-label')
  expect(wrapper.findAll('li')).toHaveLength(1)
  expect(wrapper.find('a').attributes('href')).toBe('#fnref-1')
})
it('uses the footnotes fallback and honors an explicit empty title', async () => {
  const wrapper = mount(Footnotes)
  expect(wrapper.find('figcaption').text()).toContain('footnotes')
  await wrapper.setProps({ title: '' })
  expect(wrapper.find('figcaption').exists()).toBe(false)
})
it('keeps custom components opaque', () => {
  const Hidden = defineComponent({ render: () => h('ol', [h('li', { id: 'hidden' }, 'Hidden')]) })
  const wrapper = mount(Footnotes, { slots: { default: () => h(Hidden) } })
  expect(wrapper.findAll('li')).toHaveLength(0)
})
it('updates note slots and title without mutating the host VNodes', async () => {
  const title = ref('One'),
    body = ref('first')
  const item = h('li', { id: 'original' }, 'original')
  const wrapper = mount({
    render: () =>
      h(Footnotes, { title: title.value }, () =>
        h('ol', [item, h('li', { id: 'live' }, body.value)]),
      ),
  })
  title.value = 'Two'
  body.value = 'second'
  await nextTick()
  expect(wrapper.find('figcaption').text()).toContain('Two')
  expect(wrapper.find('#live').text()).toContain('second')
  expect(item.props?.class).toBeUndefined()
  expect(item.children).toBe('original')
})
it('SSR remains visible and hydrates without warnings', async () => {
  const Root = { render: () => h(Footnotes, null, notes) }
  const container = document.createElement('div')
  container.innerHTML = await renderToString(createSSRApp(Root))
  expect(container.innerHTML).not.toMatch(/opacity:0|translateY/)
  document.body.append(container)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const app = createSSRApp(Root)
  try {
    app.mount(container)
    await nextTick()
    expect(container.querySelector('#fn-1 a')?.getAttribute('href')).toBe('#fnref-1')
    expect(warn.mock.calls.flat().join(' ')).not.toMatch(/hydration|mismatch/i)
    expect(error).not.toHaveBeenCalled()
  } finally {
    app.unmount()
    container.remove()
    warn.mockRestore()
    error.mockRestore()
  }
})
