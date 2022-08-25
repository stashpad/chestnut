const { extname } = require("path")

const directCache = ["exe", "dmg", "rpm", "deb", "AppImage"]

/**
 * Checks if the asset should be cached and generates the correct platform
 * @param fileName file to check
 * @returns file extension or false
 */
export const platformForFileName = (fileName: string) => {
  const extension = extname(fileName).slice(1)
  const arch =
    fileName.includes("arm64") || fileName.includes("aarch64") ? "_arm64" : ""

  if (
    (fileName.includes("mac") || fileName.includes("darwin")) &&
    extension === "zip"
  ) {
    return "darwin" + arch
  }

  return directCache.includes(extension) ? extension + arch : false
}
