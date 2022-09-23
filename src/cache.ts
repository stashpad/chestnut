import { ReleaseCache } from './utils/releaseCache'

const config = {
  account: process.env.ACCOUNT!,
  repository: process.env.REPOSITORY!,
  token: process.env.TOKEN,
  interval: parseInt(process.env.INTERVAL ?? '10'),
  prerelease: process.env.PRERELEASE,
  password: process.env.PASSWORD,
  url: process.env.URL
}

const cache = new ReleaseCache(config)
export default cache
