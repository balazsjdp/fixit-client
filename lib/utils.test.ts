import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('returns a single class unchanged', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('merges multiple classes', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    // tailwind-merge: p-4 overrides px-4
    expect(cn('px-4', 'p-4')).toBe('p-4')
  })

  it('handles conditional classes via clsx', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
    expect(cn('base', true && 'active')).toBe('base active')
  })

  it('handles undefined and null gracefully', () => {
    expect(cn('base', undefined, null as unknown as string)).toBe('base')
  })

  it('handles arrays', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })

  it('returns empty string when no arguments', () => {
    expect(cn()).toBe('')
  })
})
