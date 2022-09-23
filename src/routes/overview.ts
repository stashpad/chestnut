import { formatDistance, parseISO } from 'date-fns'
import express from 'express'
import cache from '../cache'
import { logger } from '../utils/logger'
import prepareView from '../utils/view'

export const overviewRouter = express.Router()

overviewRouter.get('/', async (req, res) => {
  const latest = await cache.loadCache()
  const { config } = cache

  try {
    const render = await prepareView()

    let date
    try {
      date = formatDistance(parseISO(latest.pub_date ?? ''), Date.now(), {
        addSuffix: true
      })
    } catch {
      date = 'Unknown'
    }

    const details = {
      account: config.account,
      repository: config.repository,
      date,
      files: latest.platforms,
      version: latest.version,
      releaseNotes: `https://github.com/${config.account}/${config.repository}/releases/tag/${latest.version}`,
      allReleases: `https://github.com/${config.account}/${config.repository}/releases`,
      github: `https://github.com/${config.account}/${config.repository}`
    }

    res.status(200).send(render(details))
  } catch (err) {
    logger.error(err as string)
    res.status(500).send('Error reading overview file')
  }
})

overviewRouter.get('/health', async (req, res) => {
  // Get the latest version from the cache
  const latest = await cache.loadCache()

  if (latest.platforms == null) {
    res.status(404).send()
    return
  }

  // send a 200 response if the release is found and cached
  res.status(200).send()
})

overviewRouter.get('/refresh/:password', async (req, res) => {
  const token = req.params.password
  if (!token || token !== cache.config.password) {
    return res.status(200).send()
  }

  // Force update the release files
  await cache.refreshCache(true)
  const latest = await cache.loadCache()
  if (latest.platforms == null) {
    res.status(404).send()
    return
  }

  // send a 200 response if the release is found and cached
  res.status(200).send()
})
