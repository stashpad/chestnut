import express from "express"
import { compare, valid } from "semver"
import cache from "../appCache"
import { checkAlias } from "../utils/aliases"

const { token, url } = cache.config
const shouldProxyPrivateDownload =
  token && typeof token === "string" && token.length > 0

export const updateRouter = express.Router()

updateRouter.get("/:platform/:version", async (req, res) => {
  const { platform: platformName, version } = req.params

  if (!valid(version)) {
    res.status(400).json({
      error: "version_invalid",
      message: "The specified version is not SemVer-compatible",
    })
    return
  }

  const platform = checkAlias(platformName)

  if (!platform) {
    res.status(400).send({
      error: "invalid_platform",
      message: "The specified platform is not valid",
    })
    return
  }

  // Get the latest version from the cache
  const latest = await cache.loadCache()

  if (!latest.platforms || !latest.platforms[platform]) {
    res.status(204).send()
    return
  }

  // Previously, we were checking if the latest version is
  // greater than the one on the client. However, we
  // only need to compare if they're different (even if
  // lower) in order to trigger an update.

  // This allows developers to downgrade their users
  // to a lower version in the case that a major bug happens
  // that will take a long time to fix and release
  // a patch update.

  if (compare(latest.version, version) !== 0) {
    const { notes, pub_date } = latest

    res.status(200).json({
      name: latest.version,
      notes,
      pub_date,
      url: shouldProxyPrivateDownload
        ? `${url}/download/${platformName}?update=true`
        : latest.platforms[platform].url,
    })
    return
  }

  res.status(204).send()
})
