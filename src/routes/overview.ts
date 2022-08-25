import { formatDistance, parseISO } from "date-fns"
import express from "express"
import cache from "../appCache"
import prepareView from "../utils/view"

export const overviewRouter = express.Router()

overviewRouter.get("/", async (req, res) => {
  const latest = await cache.loadCache()
  const { config } = cache

  try {
    const render = await prepareView()

    let date
    try {
      date = formatDistance(parseISO(latest.pub_date), Date.now(), {
        addSuffix: true,
      })
    } catch {
      date = "Unknown"
    }

    const details = {
      account: config.account,
      repository: config.repository,
      date,
      files: latest.platforms,
      version: latest.version,
      releaseNotes: `https://github.com/${config.account}/${config.repository}/releases/tag/${latest.version}`,
      allReleases: `https://github.com/${config.account}/${config.repository}/releases`,
      github: `https://github.com/${config.account}/${config.repository}`,
    }

    res.status(200).send(render(details))
  } catch (err) {
    console.error(err)
    res.status(500).send("Error reading overview file")
  }
})
