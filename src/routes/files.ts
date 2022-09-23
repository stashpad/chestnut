import express from 'express'
import cache from '../cache'
import {
  proxyPrivateDownload,
  shouldProxyPrivateDownload
} from '../utils/proxy'

const { token } = cache.config

export const filesRouter = express.Router()

filesRouter.get('/:filename', async (req, res) => {
  const { filename } = req.params
  const latest = await cache.loadCache()

  if (latest.files == null) {
    res.status(404).send({
      error: 'no_file',
      message: 'No files available'
    })
    return
  }

  if (!latest.files[filename]) {
    res.status(404).send({
      error: 'no_file',
      message: `Can't load ${filename}`
    })
    return
  }

  if (shouldProxyPrivateDownload(token)) {
    proxyPrivateDownload(latest.files[filename], res, token)
    return
  }

  res.writeHead(302, {
    Location: latest.files[filename].url
  })
  res.send()
})
