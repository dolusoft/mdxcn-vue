import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { MdxcnSmoke } from '../src'

describe('MdxcnSmoke', () => {
  it('renders the default label', () => {
    expect(mount(MdxcnSmoke).text()).toBe('mdxcn-vue')
  })

  it('renders a custom label', () => {
    const wrapper = mount(MdxcnSmoke, { props: { label: 'hello' } })
    expect(wrapper.get('[data-mdxcn-smoke]').text()).toBe('hello')
  })
})
