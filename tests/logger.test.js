const logger = require("../src/utils/logger")

describe("logger", () => {
  it("should throw if an error is logged", () => {
    const original = console.log
    console.log = jest.fn()
    expect(() => logger.error("my message")).toThrow()
    console.log = original
  })
})
