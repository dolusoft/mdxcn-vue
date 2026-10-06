import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Comment, Fragment, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Endpoint, endpointModel } from '../src'

const table = () =>
  h('table', [
    h('thead', [h('tr', [h('th', 'Param'), h('th', 'Type'), h('th', '')])]),
    h('tbody', [
      h('tr', [
        h('td', [h('strong', 'slug')]),
        h('td', 'string'),
        h('td', ['Registry ', h('code', 'graph-table'), ' ', h('a', { href: '/docs' }, 'Docs')]),
      ]),
      h('tr', [h('td', 'props'), h('td', ''), h('td', 'Optional')]),
    ]),
  ])
const nodes = () => [
  h('p', 'get /api/v1/components/:slug'),
  h('p', ['One ', h('em', 'component'), '.']),
  table(),
  h('pre', [
    h(
      'code',
      { class: 'language-bash' },
      '$ curl https://mdxcn.dev/api/v1/components/graph-meter\n',
    ),
  ]),
  h('pre', [h('code', { class: 'language-json' }, '{ "slug": "graph-meter" }\n')]),
]
describe('Endpoint reader', () => {
  it('keeps VitePress fences without a language and omits their label', () => {
    expect(
      endpointModel({}, [
        h('div', { class: 'language- vp-adaptive-theme' }, [
          h('button', 'Copy'),
          h('pre', [h('code', 'unmarked\n')]),
        ]),
      ]).blocks,
    ).toEqual([{ label: undefined, code: 'unmarked' }])
  })
  it.each(['js{1,3}', 'ts:line-numbers', 'cpp{1}', 'c++'])(
    'normalizes runtime fence language %s',
    (info) => {
      expect(
        endpointModel({}, [h('pre', [h('code', { class: `language-${info}` }, 'value\n')])]).blocks,
      ).toEqual([{ label: info.match(/^[^\s:{[]+/)?.[0], code: 'value' }])
    },
  )
  it('normalizes array/object classes and unwraps only one VitePress fence level', () => {
    expect(
      endpointModel({}, [
        h('pre', [h('code', { class: ['extra', { 'language-json': true }] }, 'direct\n')]),
        h('div', { class: ['language-bash', 'vp-adaptive-theme'] }, [
          h('button', { class: 'copy' }, 'Copy'),
          h('span', { class: 'lang' }, 'bash'),
          h('pre', [h('code', [h('span', '  curl /x'), '\n'])]),
        ]),
        h('div', { class: 'language-text' }, [
          h('pre', [h('code', { class: 'highlight' }, '  preserved\n\n')]),
        ]),
        h('div', [h('pre', 'hidden')]),
        h('div', { class: 'language-json' }, [h('div', [h('pre', 'nested')])]),
      ]).blocks,
    ).toEqual([
      { label: 'json', code: 'direct' },
      { label: 'request', code: '  curl /x' },
      { label: 'text', code: '  preserved\n' },
    ])
  })
  it('omits empty and whitespace-only descriptions without an empty prose wrapper', () => {
    for (const value of ['', '  \n']) {
      const input = h('table', [
        h('tbody', [h('tr', [h('td', 'name'), h('td', 'string'), h('td', value)])]),
      ])
      expect(endpointModel({}, [input]).params[0]?.description).toBeUndefined()
      const wrapper = mount(Endpoint, { slots: { default: () => input } })
      expect(wrapper.find('li .leading-relaxed').exists()).toBe(false)
      expect(wrapper.findAll('li > span')).toHaveLength(3)
      wrapper.unmount()
    }
  })
  it('ignores host whitespace before the first non-thead section', () => {
    const node = h('table', ['\n ', h('thead'), '\n ', h('tfoot', [h('tr', [h('td', 'field')])])])
    expect(endpointModel({}, [node]).params[0]?.name).toBe('field')
  })
  it('matches the upstream example route, required names, rich descriptions and fences', () => {
    const model = endpointModel({}, nodes())
    expect(model.method).toBe('GET')
    expect(model.path).toBe('/api/v1/components/:slug')
    expect(model.about).toHaveLength(1)
    expect(model.params.map(({ name, type, required }) => ({ name, type, required }))).toEqual([
      { name: 'slug', type: 'string', required: true },
      { name: 'props', type: undefined, required: false },
    ])
    expect(model.blocks).toEqual([
      { label: 'request', code: '$ curl https://mdxcn.dev/api/v1/components/graph-meter' },
      { label: 'json', code: '{ "slug": "graph-meter" }' },
    ])
  })
  it('selects props independently and keeps prose when arrays explicitly suppress parsed data', () => {
    const model = endpointModel({ method: 'patch', params: [], blocks: [] }, nodes())
    expect(model).toMatchObject({
      method: 'PATCH',
      path: '/api/v1/components/:slug',
      params: [],
      blocks: [],
    })
    expect(model.about).toHaveLength(1)
    expect(endpointModel({ path: '', method: '' }, nodes())).toMatchObject({ method: '', path: '' })
  })
  it('null fields fall back and absent input has GET / defaults', () => {
    expect(
      endpointModel({ method: null, path: null, params: null, blocks: null }, nodes()).params,
    ).toHaveLength(2)
    expect(endpointModel({}, [])).toEqual({
      method: 'GET',
      path: '/',
      about: [],
      params: [],
      blocks: [],
    })
  })
  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'QUERY'])(
    'reads %s and omits all route paragraphs from about',
    (method) => {
      expect(endpointModel({}, [h('p', `${method} /first`), h('p', 'GET /second')])).toMatchObject({
        method,
        path: '/first',
        about: [],
      })
    },
  )
  it('rejects unsupported methods and extra path tokens, leaving them as prose', () => {
    const model = endpointModel({}, [h('p', 'TRACE /x'), h('p', 'GET /x extra')])
    expect(model.method).toBe('GET')
    expect(model.path).toBe('/')
    expect(model.about).toHaveLength(2)
  })
  it('only reads the first direct table, unwraps fragments and ignores components', () => {
    const Wrapped = defineComponent({ render: () => h('p', 'POST /hidden') })
    expect(
      endpointModel({}, [h(Fragment, [h(Comment), h(Wrapped), ...nodes(), table()])]).params,
    ).toHaveLength(2)
    expect(endpointModel({}, [h(Wrapped)]).path).toBe('/')
  })
  it('keeps own th/td behavior and does not treat bold final names as a footer', () => {
    const input = h('table', [
      h('tbody', [
        h('tr', [
          h('th', [h('span', [h('b', 'Total')])]),
          h('td', 'number'),
          h('td', 'description'),
          h('td', 'ignored'),
        ]),
      ]),
    ])
    expect(endpointModel({}, [input]).params[0]).toMatchObject({
      name: 'Total',
      type: 'number',
      required: true,
    })
    expect(endpointModel({}, [h('table', [h('tr', [h('td', 'direct')])])]).params).toEqual([])
  })
  it('trims exactly one fence newline and preserves indent and request detection', () => {
    const model = endpointModel({}, [
      h('pre', '  curl /x\n\n'),
      h('pre', [h('code', { class: 'language-text' }, '  body\n')]),
      h('pre', '$other'),
    ])
    expect(model.blocks).toEqual([
      { label: 'request', code: '  curl /x\n' },
      { label: 'text', code: '  body' },
      { label: undefined, code: '$other' },
    ])
  })
})
describe('Endpoint rendering', () => {
  it('renders typed about paragraphs, observes replacements and honors empty arrays', async () => {
    const wrapper = mount(Endpoint, {
      props: {
        about: [
          [
            {
              type: 'link',
              href: '/docs',
              title: 'Guide',
              target: '_blank',
              rel: 'noreferrer',
              children: [{ type: 'text', value: 'Docs' }],
            },
          ],
        ],
      },
      slots: { default: () => h('p', 'Fallback') },
    })
    expect(wrapper.get('p a').attributes()).toEqual({
      href: '/docs',
      title: 'Guide',
      target: '_blank',
      rel: 'noreferrer',
    })
    expect(wrapper.text()).not.toContain('Fallback')
    await wrapper.setProps({ about: [[{ type: 'text', value: 'Updated' }]] })
    expect(wrapper.text()).toContain('Updated')
    await wrapper.setProps({ about: [] })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Fallback')
    await wrapper.setProps({ about: null })
    expect(wrapper.text()).toContain('Fallback')
    wrapper.unmount()
  })
  it('names focusable code regions with the caption or an untitled fallback', async () => {
    const wrapper = mount(Endpoint, { props: { blocks: [{ label: 'json', code: '{}' }] } })
    const region = wrapper.get('[role="region"]')
    expect(region.attributes('tabindex')).toBe('0')
    expect(region.attributes('aria-labelledby')).toBe(wrapper.get('figcaption').attributes('id'))
    await wrapper.setProps({ title: '' })
    expect(region.attributes('aria-labelledby')).toBeUndefined()
    expect(region.attributes('aria-label')).toBe('json')
    wrapper.unmount()
  })
  it('preserves rich hosts, upstream DOM/classes and required accessibility text', () => {
    const wrapper = mount(Endpoint, { slots: { default: nodes } })
    expect(wrapper.get('figcaption').text()).toBe('[ endpoint ]')
    expect(wrapper.get('ul').attributes('role')).toBe('list')
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.get('li code').text()).toBe('graph-table')
    expect(wrapper.get('li a').attributes('href')).toBe('/docs')
    expect(wrapper.get('li .sr-only').text()).toBe('(required)')
    expect(wrapper.get('li span[aria-hidden]').text()).toBe('*')
    expect(wrapper.get('em').text()).toBe('component')
    expect(wrapper.findAll('pre code').map((code) => code.text())).toEqual([
      '$ curl https://mdxcn.dev/api/v1/components/graph-meter',
      '{ "slug": "graph-meter" }',
    ])
    expect(wrapper.get('li').classes()).toContain('max-sm:grid-cols-[1.25rem_minmax(0,1fr)_auto]')
    wrapper.unmount()
  })
  it('renders typed prose and VNode descriptions, forwards attrs and escapes code', () => {
    const wrapper = mount(Endpoint, {
      props: {
        title: 'API',
        corner: '#',
        className: 'custom',
        params: [
          {
            name: 'rich',
            description: [{ type: 'code', children: [{ type: 'text', value: 'typed' }] }],
          },
          { name: 'node', description: h('a', { href: '/node' }, 'node') },
        ],
        blocks: [{ code: '<script>bad()</script>' }],
      },
      attrs: { 'data-test': 'forwarded' },
    })
    expect(wrapper.get('li code').text()).toBe('typed')
    expect(wrapper.get('li a').attributes('href')).toBe('/node')
    expect(wrapper.get('figure').attributes('data-test')).toBe('forwarded')
    expect(wrapper.get('figure').classes()).toContain('custom')
    expect(wrapper.get('pre code').text()).toBe('<script>bad()</script>')
    expect(wrapper.find('script').exists()).toBe(false)
    wrapper.unmount()
  })
  it('reparses slots and props under the same key', async () => {
    const state = ref('old')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Endpoint, { key: 'same', blocks: [{ code: state.value }] }, () => [
            h('p', `POST /${state.value}`),
          ]),
      }),
    )
    const figure = wrapper.get('figure').element
    state.value = 'new'
    await nextTick()
    expect(wrapper.text()).toContain('/new')
    expect(wrapper.get('code').text()).toBe('new')
    expect(wrapper.get('figure').element).toBe(figure)
    wrapper.unmount()
  })
  it('hydrates visible SSR without mismatches', async () => {
    const render = () => h(Endpoint, null, nodes)
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp({ render }))
    const before = container.innerHTML
    expect(before).not.toMatch(/opacity:\s*0(?:;|")|translateY/)
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp({ render })
    app.mount(container)
    expect(container.innerHTML).toBe(before)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    app.unmount()
    vi.restoreAllMocks()
  })
})
