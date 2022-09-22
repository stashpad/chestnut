import { rest } from 'msw'
import { setupServer } from 'msw/node'

export const response = [
  {
    tag_name: 'v1.0.0',
    body: 'Description of the release',
    draft: false,
    prerelease: false,
    created_at: '2013-02-27T19:35:32Z',
    published_at: '2013-02-27T19:35:32Z',
    assets: [
      {
        url: 'https://api.github.com/repos/octocat/Hello-World/releases/assets/1',
        browser_download_url:
          'https://github.com/octocat/Hello-World/releases/download/v1.0.0/example.zip',
        name: 'example.zip',
        content_type: 'application/zip',
        size: 1024,
        download_count: 42
      }
    ]
  }
]

export const okResponse = {
  status: 200,
  json: async () => response
}
export const notFoundResponse = { status: 404 }

const restHandlers = [
  rest.get(/^https:\/\//, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(response))
  })
]

export const server = setupServer(...restHandlers)
