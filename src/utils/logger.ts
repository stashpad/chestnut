import colorLogger from "node-color-log"

const messageTypes = {
  error: "[ERROR] ",
  info: "[INFO]  ",
  warn: "[WARN]  ",
}

const error = (message: string) => {
  const error = new Error(message)
  colorLogger
    .dim()
    .log(new Date().toISOString() + " ")
    .joint()
    .color("red")
    .bold()
    .log(messageTypes.error)
    .joint()
    .log(error.message)
  throw error
}

const info = (message: string) => {
  colorLogger
    .dim()
    .log(new Date().toISOString() + " ")
    .joint()
    .color("white")
    .bold()
    .log(messageTypes.info)
    .joint()
    .log(message)
}

const warn = (message: string) => {
  colorLogger
    .dim()
    .log(new Date().toISOString() + " ")
    .joint()
    .color("yellow")
    .bold()
    .log(messageTypes.warn)
    .joint()
    .log(message)
}

export const logger = { error, info, warn }
