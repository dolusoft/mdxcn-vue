import { expect, it } from 'vitest'
import { numbers, words, splitDash } from '../src/core'

it('words preserves arrays and splits whitespace and commas', () => {
  expect(words(undefined)).toEqual([])
  expect(words(' a,b\n c,, ')).toEqual(['a', 'b', 'c'])
  const input = ['a,b', 'c']
  expect(words(input)).toEqual(input)
  expect(words(input)).not.toBe(input)
})
it('numbers expands runs and filters nonfinite string entries only', () => {
  expect(numbers('2*3,4×2 -1 2.5 bad Infinity')).toEqual([2, 2, 2, 4, 4, -1, 2.5])
  expect(numbers('1*0 1*10000')).toEqual([])
  expect(numbers(undefined)).toEqual([])
  expect(numbers([NaN, Infinity])).toEqual([NaN, Infinity])
})
it('splitDash retains the entire caption after spaced em or en dashes', () => {
  expect(splitDash('instant — first – second')).toEqual({
    label: 'instant',
    rest: 'first — second',
  })
  expect(splitDash('no-dash')).toEqual({ label: 'no-dash', rest: '' })
})
