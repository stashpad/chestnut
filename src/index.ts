import dotenv from "dotenv"
import express from "express"
dotenv.config()

import helmet from "helmet"
import { downloadRouter } from "./routes/download"
import { filesRouter } from "./routes/files"
import { overviewRouter } from "./routes/overview"
import { updateRouter } from "./routes/update"

export const app = express()
app.use(helmet())

app.use("/", overviewRouter)
app.use("/download", downloadRouter)
app.use("/update", updateRouter)
app.use("/files", filesRouter)

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res
      .status(500)
      .send({ error: "internal_error", message: "Internal server error" })
  }
)
