import express from "express"
import cache from "../appCache"
import { proxyPrivateDownload } from "../utils/proxy"

const { token, url } = cache.config
const shouldProxyPrivateDownload =
  token && typeof token === "string" && token.length > 0

export const filesRouter = express.Router()

filesRouter.get("/:filename", async (req, res) => {
  const { filename } = req.params
  const latest = await cache.loadCache()

  // TODO: standardize json responses
  if (!latest.files) {
    res.status(404).send("No files available")
    return
  }

  if (!latest.files[filename]) {
    res.status(404).send(`Can't load ${filename}`)
    return
  }

  if (shouldProxyPrivateDownload) {
    proxyPrivateDownload(latest.files[filename], req, res)
    return
  }

  res.writeHead(302, {
    Location: latest.files[filename].url,
  })
  res.send()
})
