const { ReleaseCache } = require("../dist/utils/releaseCache")
const fetch = require("node-fetch")
const { okResponse } = require("./response")

// Test config data
const account = "testaccount"
const repository = "testrepo"
const token = "ghp_asdf1111asdf222asdf3333asdf4444asdf"

process.env.ACCOUNT = account
process.env.REPOSITORY = repository
process.env.TOKEN = token

describe("cache", () => {
  let realConsoleLog = console.log

  beforeAll(() => {
    realConsoleLog = console.log
    console.log = jest.fn()
  })

  afterAll(() => {
    console.log = realConsoleLog
  })

  afterEach(() => {
    fetch.mockReset()
  })

  it("should throw when account is not defined", () => {
    expect(() => {
      const config = { repository }
      console.log("fon", config)
      new ReleaseCache(config)
    }).toThrow(/ACCOUNT/)
  })

  it("should throw when repository is not defined", () => {
    expect(() => {
      const config = { account }
      new ReleaseCache(config)
    }).toThrow(/REPOSITORY/)
  })

  it("should run without errors", () => {
    const config = {
      account,
      repository,
      token,
    }

    new ReleaseCache(config)
  })

  it.skip("should load the cache", async () => {
    fetch.mockResolvedValue(okResponse)

    const config = {
      account,
      repository,
      token,
    }

    const cache = new ReleaseCache(config)
    const storage = await cache.loadCache()
    expect(fetch).toHaveBeenCalledTimes(1)

    expect(typeof storage.version).toBe("string")
    expect(typeof storage.platforms).toBe("object")
    expect(typeof storage.files).toBe("object")
  })

  it.skip("should load the cache, and refresh it once at most", async () => {
    fetch.mockResolvedValue(okResponse)

    const config = {
      account,
      repository,
      token,
    }

    const cache = new ReleaseCache(config)
    const storage = await cache.loadCache()

    expect(fetch).toHaveBeenCalledTimes(1)

    await cache.loadCache()
    expect(fetch).toHaveBeenCalledTimes(2)
    await cache.loadCache()
    expect(fetch).toHaveBeenCalledTimes(2)
    await cache.loadCache()
    expect(fetch).toHaveBeenCalledTimes(2)
    await cache.loadCache()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
