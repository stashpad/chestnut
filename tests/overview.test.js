const request = require("supertest")
const fetch = require("node-fetch")
const { app } = require("../src/index")
const { okResponse, notFoundResponse } = require("./response")

describe("overview", () => {
  let realConsoleLog = console.log

  beforeAll(() => {
    realConsoleLog = console.log
    console.log = jest.fn()
  })

  afterAll(() => {
    console.log = realConsoleLog
  })

  afterEach(() => {
    fetch.mockReset()
  })

  it("returns a 200", (done) => {
    fetch.mockResolvedValue(okResponse)

    request(app).get("/").expect(200).end(done)
  })

  it("returns a 200 even if the github repo is not found", (done) => {
    fetch.mockResolvedValue(notFoundResponse)

    request(app).get("/").expect(200).end(done)
  })
})
