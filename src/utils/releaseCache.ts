import retry from 'async-retry'
import ms from 'ms'
import fetch from 'node-fetch'
import { platformForFileName } from './aliases'
import { logger } from './logger'
import { clearFilesFromDisk, downloadFileToDisk, toMB } from './proxy'

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
  files?: Record<string, IFileMetadata>
  fullyDownloaded?: boolean
}

export interface IGithubAsset {
  name: string
  browser_download_url: string
  url: string
  content_type: string
  /**
   * in KB
   */
  size: number
}

export interface IGitHubRelease {
  assets: IGithubAsset[]
  tag_name: string
  /**
   * Release notes
   */
  body: string
  published_at: string
}

export interface IFileMetadata {
  name: string
  api_url: string
  url: string
  content_type: string
  /**
   * in MB
   */
  size: number
  cached?: boolean
}

export class ReleaseCache {
  public config: IConfig
  private latest: ILatest
  private lastUpdate: number | null // timestamp in ms

  /**
   * {
   *    account: Github account or organization name
   *    repository: Github repository within the account
   *    token: For private mode, a GitHub token that has access to the `repo` permission
   * }
   * @param {*} config
   */
  constructor(config: IConfig) {
    const { account, repository } = config
    this.config = config

    if (!account) {
      logger.error(
        'ACCOUNT is not defined. Please define an ACCOUNT environment variable'
      )
    }

    if (!repository) {
      logger.error(
        'REPOSITORY is not defined. Please define an REPOSITORY environment variable'
      )
    }

    this.latest = {}
    this.lastUpdate = null

    // try to populate cache at startup
    this.loadCache()
  }

  shouldProxyPrivateDownload = () => {
    const { token } = this.config
    return token && typeof token === 'string' && token.length > 0
  }

  refreshCache = async () => {
    logger.info('Checking GitHub for latest release...')
    const { account, repository, prerelease, token } = this.config
    const repo = account + '/' + repository
    const url = `https://api.github.com/repos/${repo}/releases?per_page=100`
    const headers: HeadersInit = { Accept: 'application/vnd.github.preview' }

    if (token && typeof token === 'string' && token.length > 0) {
      headers.Authorization = `token ${token}`
    }

    let response: Record<any, any> | null

    try {
      const retries = process.env.NODE_ENV === 'production' ? 3 : 0

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
    const release: IGitHubRelease = data.find(isReleaseValid)

    if (!release || !release.assets || !Array.isArray(release.assets)) {
      return
    }

    const { tag_name } = release

    if (this.latest.version === tag_name) {
      logger.info(
        `No updates - cached version ${this.latest.version} is the latest`
      )
      this.lastUpdate = Date.now()
      return
    }

    // Clear list of download links
    this.latest.platforms = {}
    this.latest.files = {}
    this.latest.fullyDownloaded = false
    clearFilesFromDisk()
    logger.info('Clearing cached data')

    logger.info(`Caching version ${tag_name}`)

    this.latest.version = tag_name
    this.latest.notes = release.body
    this.latest.pub_date = release.published_at

    const downloadPromises: Array<Promise<any>> = []
    for (const asset of release.assets) {
      const { name, browser_download_url, url, content_type, size } = asset

      const metadata: IFileMetadata = {
        name,
        api_url: url,
        url: browser_download_url,
        content_type,
        size: toMB(size)
      }

      const downloadProm = downloadFileToDisk(metadata, this.config.token)
      downloadProm.then(() => {
        metadata.cached = true
        logger.info(`${name} is cached`)
      })
      downloadPromises.push(downloadProm)
      this.latest.files[name] = metadata

      const platform = platformForFileName(name)
      if (!platform) {
        continue
      }

      this.latest.platforms[platform] = metadata
    }

    Promise.all(downloadPromises).then(() => {
      this.latest.fullyDownloaded = true
      logger.info(`✅ Finished downloading ${downloadPromises.length} files`)
    })

    this.lastUpdate = Date.now()
  }

  isOutdated = () => {
    const { config } = this
    const { interval = 10 } = config

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
  public loadCache = async () => {
    const { latest, refreshCache, isOutdated } = this

    if (!this.lastUpdate || isOutdated()) {
      if (!this.lastUpdate) logger.info('No previous update available')
      if (isOutdated()) logger.info('Passed refresh interval')
      await refreshCache()
    }

    return Object.assign({}, latest)
  }
}
