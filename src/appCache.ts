import { Cache } from "./utils/cache"

const config = {
  account: process.env.ACCOUNT,
  repository: process.env.REPOSITORY,
  token: process.env.TOKEN,
  interval: process.env.INTERVAL,
  prerelease: process.env.PRERELEASE,
  url: process.env.URL,
}

const cache = new Cache(config)
export default cache
