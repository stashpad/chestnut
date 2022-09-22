import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { ReleaseCache } from '../src/utils/releaseCache'
import { server } from './testServer'

// Test config data
const account = 'testaccount'
const repository = 'testrepo'
const token = 'ghp_asdf1111asdf222asdf3333asdf4444asdf'

process.env.ACCOUNT = account
process.env.REPOSITORY = repository
process.env.TOKEN = token

describe('cache', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterAll(() => server.close())

  afterEach(() => server.resetHandlers())

  it('should throw when account is not defined', () => {
    expect(() => {
      const config = { repository, account: '' }
      console.log('fon', config)
      new ReleaseCache(config)
    }).toThrow(/ACCOUNT/)
  })

  it('should throw when repository is not defined', () => {
    expect(() => {
      const config = { repository: '', account }
      new ReleaseCache(config)
    }).toThrow(/REPOSITORY/)
  })

  it('should run without errors', () => {
    const config = {
      account,
      repository,
      token
    }

    new ReleaseCache(config)
  })

  it('should load the cache', async () => {
    const config = {
      account,
      repository,
      token
    }

    const cache = new ReleaseCache(config)
    const cacheSpy = vi.spyOn(cache, 'loadCache')

    const storage = await cache.loadCache()

    expect(cacheSpy).toHaveBeenCalledTimes(1)
    expect(typeof storage.version).toBe('string')
    expect(typeof storage.platforms).toBe('object')
    expect(typeof storage.files).toBe('object')
  })

  it('should load the cache, and refresh it once at most', async () => {
    const config = {
      account,
      repository,
      token
    }

    const cache = new ReleaseCache(config)
    const refreshSpy = vi.spyOn(cache, 'refreshCache')
    await cache.loadCache()
    expect(refreshSpy).toHaveBeenCalledTimes(1)

    await cache.loadCache()
    expect(refreshSpy).toHaveBeenCalledTimes(1)
    await cache.loadCache()
    expect(refreshSpy).toHaveBeenCalledTimes(1)
  })
})
