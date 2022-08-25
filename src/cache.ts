import { ReleaseCache } from "./utils/releaseCache"

const config = {
  account: process.env.ACCOUNT,
  repository: process.env.REPOSITORY,
  token: process.env.TOKEN,
  interval: process.env.INTERVAL,
  prerelease: process.env.PRERELEASE,
  url: process.env.URL,
}

const cache = new ReleaseCache(config)
export default cache
