import { describe, expect, it, vi } from 'vitest'
import { logger } from '../src/utils/logger'

describe('logger', () => {
  it('should throw an error', () => {
    const original = console.log
    console.log = vi.fn()
    expect(() => logger.error('my message')).toThrow()
    console.log = original
  })
})
