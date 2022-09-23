/* eslint-disable import/first */
import dotenv from 'dotenv'
dotenv.config()

import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
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

app.listen(port, () => logger.info(`Chestnut listening on port ${port}`))
