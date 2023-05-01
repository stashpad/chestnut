/* eslint-disable import/first */
import dotenv from 'dotenv'
dotenv.config()

import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import { config } from './cache'
import { downloadRouter } from './routes/download'
import { filesRouter } from './routes/files'
import { overviewRouter } from './routes/overview'
import { updateRouter } from './routes/update'
import { logger } from './utils/logger'

export const app = express()
app.use(helmet())

app.use('/', overviewRouter)
app.use('/download', downloadRouter)
app.use('/update', updateRouter)
app.use('/files', filesRouter)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res
    .status(500)
    .send({ error: 'internal_error', message: 'Internal server error' })
})

const port = process.env.PORT ?? 3000

logger.info(`Using setting: ACCOUNT: ${config.account}`)
logger.info(`Using setting: REPOSITORY: ${config.repository}`)
logger.info(`Using setting: URL: ${config.url}`)
logger.info(`Using setting: TOKEN: ${config.token}`)
logger.info(`Using setting: PRERELEASE: ${config.prerelease}`)
logger.info(`Using setting: URL: ${config.url}`)
logger.info(`Using setting: INTERVAL: ${config.interval}`)

app.listen(port, () => logger.info(`Chestnut listening on port ${port}`))
