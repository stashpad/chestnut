import { extname } from 'path'

const aliases: Record<string, string[]> = {
  darwin: ['mac', 'macos', 'osx'],
  exe: ['win32', 'windows', 'win'],
  deb: ['debian'],
  rpm: ['fedora'],
  AppImage: ['appimage', 'linux'],
  dmg: ['dmg']
}

for (const existingPlatform of Object.keys(aliases)) {
  const newPlatform = existingPlatform + '_arm64'
  aliases[newPlatform] = aliases[existingPlatform].map(
    (alias: string) => `${alias}_arm64`
  )
}

export const checkAlias = (platform: string) => {
  // original platform name
  if (typeof aliases[platform] !== 'undefined') {
    return platform
  }

  for (const guess of Object.keys(aliases)) {
    const list = aliases[guess]

    if (list.includes(platform)) {
      return guess
    }
  }

  return false
}

const directCache = ['exe', 'dmg', 'rpm', 'deb', 'AppImage']

/**
 * Checks if the asset should be cached and generates the correct platform
 * @param fileName file to check
 * @returns file extension or false
 */
export const platformForFileName = (fileName: string) => {
  const extension = extname(fileName).slice(1)
  const arch =
    fileName.includes('arm64') || fileName.includes('aarch64') ? '_arm64' : ''

  if (
    (fileName.includes('mac') || fileName.includes('darwin')) &&
    extension === 'zip'
  ) {
    return 'darwin' + arch
  }

  return directCache.includes(extension) ? extension + arch : false
}
