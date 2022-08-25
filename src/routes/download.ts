import express from "express"
import { parse } from "express-useragent"
import { parse as parseQuery } from "query-string"
import cache from "../cache"
import { checkAlias } from "../utils/aliases"
import { proxyPrivateDownload } from "../utils/proxy"

export const downloadRouter = express.Router()

const { token, url } = cache.config
const shouldProxyPrivateDownload =
  token && typeof token === "string" && token.length > 0

downloadRouter.get("/", async (req, res) => {
  const userAgent = parse(req.headers["user-agent"])
  const params = parseQuery(req.query.toString())
  const isUpdate = params && params.update

  let platform = ""

  if (userAgent.isMac && isUpdate) {
    platform = "darwin"
  } else if (userAgent.isMac && !isUpdate) {
    platform = "dmg"
  } else if (userAgent.isWindows) {
    platform = "exe"
  } else if (userAgent.isLinux) {
    platform = "AppImage"
  }

  const { platforms } = await cache.loadCache()

  if (!platform || !platforms || !platforms[platform]) {
    res.status(404).send({
      error: "no_file",
      message: "No download available for your platform",
    })
    return
  }

  if (shouldProxyPrivateDownload) {
    proxyPrivateDownload(platforms[platform], res, cache.config.token)
    return
  }

  res.writeHead(302, {
    Location: platforms[platform].url,
  })

  res.send()
})

downloadRouter.get("/:platform", async (req, res) => {
  const queryParams = parseQuery(req.query.toString())
  const isUpdate = queryParams && queryParams.update

  let platform: string | false = req.params.platform
  if (platform === "mac" && !isUpdate) {
    platform = "dmg"
  }

  if (platform === "mac_arm64" && !isUpdate) {
    platform = "dmg_arm64"
  }

  // Get the latest version from the cache
  const latest = await cache.loadCache()

  // Check platform for appropiate aliases
  platform = checkAlias(platform)

  if (!platform) {
    res.status(400).send({
      error: "invalid_platform",
      message: "The specified platform is not valid",
    })
    return
  }

  if (!latest.platforms || !latest.platforms[platform]) {
    res.status(404).send({
      error: "no_file",
      message: "No download available for your platform",
    })
    return
  }

  if (token && typeof token === "string" && token.length > 0) {
    proxyPrivateDownload(latest.platforms[platform], res, cache.config.token)
    return
  }

  res.writeHead(302, {
    Location: latest.platforms[platform].url,
  })

  res.send()
})
