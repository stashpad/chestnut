import retry from "async-retry"
import ms from "ms"
import fetch from "node-fetch"
import { logger } from "./logger"
import { platformForFileName } from "./platform"

export interface IConfig {
  account: string
  repository: string
  token?: string
  interval?: string
  prerelease?: string
  url?: string
}
export interface ILatest {
  pub_date?: string
  notes?: string
  version?: string
  platforms?: Record<string, any>
  files?: Record<string, any>
}

export class Cache {
  public config: IConfig
  private latest: ILatest
  private lastUpdate: number //timestamp in ms

  /**
   * {
   *    account: Github account or organization name
   *    repository: Github repository within the account
   *    token: For private mode, a GitHub token that has access to the `repo` permission
   * }
   * @param {*} config
   */
  constructor(config: IConfig) {
    const { account, repository, token, interval, prerelease, url } = config
    this.config = config

    if (!account) {
      logger.error(
        "ACCOUNT is not defined. Please define an ACCOUNT environment variable"
      )
    }

    if (!repository) {
      logger.error(
        "REPOSITORY is not defined. Please define an REPOSITORY environment variable"
      )
    }

    this.latest = {}
    this.lastUpdate = null
  }

  shouldProxyPrivateDownload = () => {
    const { token } = this.config
    return token && typeof token === "string" && token.length > 0
  }

  refreshCache = async () => {
    logger.info("Checking GitHub for latest release...")
    const { account, repository, prerelease, token } = this.config
    const repo = account + "/" + repository
    const url = `https://api.github.com/repos/${repo}/releases?per_page=100`
    const headers: HeadersInit = { Accept: "application/vnd.github.preview" }

    if (token && typeof token === "string" && token.length > 0) {
      headers.Authorization = `token ${token}`
    }

    let response: Record<any, any> | null

    try {
      let retries = process.env.NODE_ENV === "production" ? 3 : 0

      response = await retry(
        async () => {
          const res = await fetch(url, { headers })

          if (res.status !== 200) {
            logger.error(
              `GitHub API responded with ${res.status} for url ${url}`
            )
          }

          return res
        },
        { retries }
      )
    } catch {
      return false
    }

    if (!response) return false

    const data = await response.json()

    if (!Array.isArray(data) || data.length === 0) {
      return
    }

    const isReleaseValid = (item: any) => {
      const wantPreReleases = Boolean(prerelease)
      const isPrerelease = Boolean(item.prerelease)
      const isDraft = Boolean(item.draft)
      if (isDraft) return false
      if (isPrerelease && !wantPreReleases) return false
      return true
    }
    const release = data.find(isReleaseValid)

    if (!release || !release.assets || !Array.isArray(release.assets)) {
      return
    }

    const { tag_name } = release

    if (this.latest.version === tag_name) {
      logger.info("Cached version is the same as the latest")
      this.lastUpdate = Date.now()
      return
    }

    logger.info(`Caching version ${tag_name}...`)

    this.latest.version = tag_name
    this.latest.notes = release.body
    this.latest.pub_date = release.published_at

    // Clear list of download links
    this.latest.platforms = {}
    this.latest.files = {}

    for (const asset of release.assets) {
      const { name, browser_download_url, url, content_type, size } = asset

      const metadata = {
        name,
        api_url: url,
        url: browser_download_url,
        content_type,
        // TODO extract to utility function
        size: Math.round((size / 1000000) * 10) / 10,
      }

      this.latest.files[name] = metadata

      const platform = platformForFileName(name)
      if (!platform) {
        continue
      }

      this.latest.platforms[platform] = metadata

      // TODO: save to disk
    }
  }

  isOutdated = () => {
    const { config } = this
    const { interval = 15 } = config

    if (this.lastUpdate && Date.now() - this.lastUpdate > ms(`${interval}m`)) {
      return true
    }

    return false
  }

  /**
   * This is a method returning the cache
   * because the cache would otherwise be loaded
   * only once when the index file is parsed
   * @returns Cache object
   */
  loadCache = async () => {
    const { latest, refreshCache, isOutdated } = this

    if (!this.lastUpdate || isOutdated()) {
      if (!this.lastUpdate) logger.info("No previous update available")
      if (isOutdated()) logger.info("Passed refresh interval")
      await refreshCache()
    }

    return Object.assign({}, latest)
  }
}
