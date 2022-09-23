import { app } from './index'
import { logger } from './utils/logger'

const port = process.env.PORT ?? 3000

app.listen(port, () => logger.info(`Chestnut listening on port ${port}`))
