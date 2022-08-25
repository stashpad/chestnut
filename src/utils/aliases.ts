const aliases: Record<string, string[]> = {
  darwin: ["mac", "macos", "osx"],
  exe: ["win32", "windows", "win"],
  deb: ["debian"],
  rpm: ["fedora"],
  AppImage: ["appimage"],
  dmg: ["dmg"],
}

for (const existingPlatform of Object.keys(aliases)) {
  const newPlatform = existingPlatform + "_arm64"
  aliases[newPlatform] = aliases[existingPlatform].map(
    (alias: string) => `${alias}_arm64`
  )
}

type platforms = "darwin" | "exe" | "deb" | "rpm" | "AppImage" | "dmg"

export const checkAlias = (platform: string) => {
  // original platform name
  if (typeof aliases[platform] !== "undefined") {
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
