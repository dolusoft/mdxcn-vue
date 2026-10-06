import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import type { Component } from 'vue'
import { Chat, GraphSpec, GraphTimeline } from '../src'

// Compiled slots carry TEXT/block hints. `dropText` clones hosts with new children, so an
// update must patch the clones as plain elements: the DOM after an update has to equal a
// fresh mount with the final value, and must never contain "[object Object]".
const list = (item: string) => `<ul><li>${item}</li></ul>`
const cases: [string, Component, string][] = [
  ['Chat em head', Chat, list('<em>you: {{ m }}</em>')],
  ['Chat strong head with tail', Chat, list('<strong>you: {{ m }}</strong> tail')],
  ['Chat text then em', Chat, list('you: <em>{{ m }}</em>')],
  [
    'Chat paragraph code with body',
    Chat,
    '<ul><li><p>you: <code>{{ m }}</code></p><p>b</p></li></ul>',
  ],
  [
    'Chat nested hosts',
    Chat,
    list('<strong>you: <em>{{ m }}</em> and <code>{{ m }}</code></strong>'),
  ],
  [
    'Chat v-for items',
    Chat,
    '<ul><li v-for="x in [1, 2]" :key="x"><em>you: {{ m }}</em> {{ x }}</li></ul>',
  ],
  ['Chat dynamic attribute', Chat, list('<a :href="m">you: <b>{{ m }}</b></a>')],
  ['Chat v-if block host', Chat, list('<em v-if="m">you: {{ m }} <b>{{ m }}</b></em>')],
  [
    'Chat v-for inside host',
    Chat,
    list('<em>you: <span v-for="x in [1, 2]" :key="x">{{ m }}</span></em>'),
  ],
  ['GraphSpec code', GraphSpec, list('Label: <code>{{ m }}</code>')],
  ['GraphSpec link with em', GraphSpec, list('Label: <a :href="m"><em>{{ m }}</em></a>')],
  [
    'GraphSpec strike and body',
    GraphSpec,
    '<ul><li><p>Label: <del>{{ m }}</del> x</p><p>{{ m }}</p></li></ul>',
  ],
  [
    'GraphSpec v-if block code',
    GraphSpec,
    list('Label: <code v-if="m">{{ m }} <b>{{ m }}</b></code>'),
  ],
  [
    'GraphTimeline strong and code',
    GraphTimeline,
    list('Mon: <strong>{{ m }}</strong> — <code>{{ m }}</code>'),
  ],
]
const stripped = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/ aria-labelledby="[^"]*"/g, '')

describe('dropText clones under reactive updates', () => {
  it.each(cases)('%s', async (_name, component, template) => {
    const mountWith = (initial: string) => {
      const m = ref(initial)
      const wrapper = mount(
        defineComponent({
          components: { Widget: component },
          setup: () => ({ m }),
          template: `<Widget title="T">${template}</Widget>`,
        }),
      )
      return { m, wrapper }
    }
    const updated = mountWith('before')
    updated.m.value = 'after'
    await nextTick()
    const fresh = mountWith('after')
    const html = stripped(updated.wrapper.html())
    expect(html).not.toContain('[object Object]')
    expect(html).toBe(stripped(fresh.wrapper.html()))
    updated.wrapper.unmount()
    fresh.wrapper.unmount()
  })
})
