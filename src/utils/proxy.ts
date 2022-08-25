import express from "express"
import fetch, { RequestInit } from "node-fetch"
import cache from "../appCache"

export const proxyPrivateDownload = (
  asset: { api_url: string; name: string },
  _: express.Request,
  res: express.Response
) => {
  const redirect = "manual"
  const headers = { Accept: "application/octet-stream" }
  const options: RequestInit = { headers, redirect }
  const { api_url: rawUrl, name } = asset

  const finalUrl = rawUrl.replace(
    "https://api.github.com/",
    `https://${cache.config.token}@api.github.com/`
  )

  fetch(finalUrl, options).then((assetRes) => {
    res.setHeader("Location", assetRes.headers.get("Location"))
    res.status(302).send()
  })
}

// export const downloadFileToDisk = (
//   asset: { api_url: string },
//   filepath: string
// ) => {
//   const headers = { Accept: "application/octet-stream" }
//   const options: RequestInit = { headers }
//   const { api_url: rawUrl } = asset

//   const finalUrl = rawUrl.replace(
//     "https://api.github.com/",
//     `https://${cache.config.token}@api.github.com/`
//   )

//   fetch(finalUrl, options).then((assetRes) => {
//     const filestream = fs.createWriteStream(filepath)
//     return new Promise((res, rej) => {
//       assetRes.body.pipe(filestream)
//       assetRes.body.on("error", rej)
//       filestream.on("finish", res)
//     })
//   })
// }
