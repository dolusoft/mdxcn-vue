import { describe, expect, it } from 'vitest'
import { MDXCN_MARKDOWN_STAGE } from '../src'

describe('mdxcn-markdown', () => {
  it('exposes the scaffold marker', () => {
    expect(MDXCN_MARKDOWN_STAGE).toBe('scaffold')
  })
})
