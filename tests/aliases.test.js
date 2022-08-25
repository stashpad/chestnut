const { checkAlias } = require("../src/utils/aliases")

describe("aliases", () => {
  it("should accept platforms", () => {
    const darwin = checkAlias("darwin")
    const exe = checkAlias("exe")
    const deb = checkAlias("deb")
    const rpm = checkAlias("rpm")
    const AppImage = checkAlias("AppImage")
    const dmg = checkAlias("dmg")
    expect([darwin, exe, deb, rpm, AppImage, dmg]).toStrictEqual([
      "darwin",
      "exe",
      "deb",
      "rpm",
      "AppImage",
      "dmg",
    ])
  })

  it("should accept mac variants", () => {
    const mac = checkAlias("mac")
    const macos = checkAlias("macos")
    const osx = checkAlias("osx")

    const d = "darwin"
    const expected = [d, d, d]

    expect([mac, macos, osx]).toStrictEqual(expected)
  })

  it("should generate arm64 variants", () => {
    const mac = checkAlias("mac_arm64")
    const macos = checkAlias("macos_arm64")
    const osx = checkAlias("osx_arm64")

    const d = "darwin_arm64"
    const expected = [d, d, d]

    expect([mac, macos, osx]).toStrictEqual(expected)
  })

  it("should accept windows variants", () => {
    const win = checkAlias("win")
    const win32 = checkAlias("win32")
    const windows = checkAlias("windows")

    const exe = "exe"
    const expected = [exe, exe, exe]

    expect([win, win32, windows]).toStrictEqual(expected)
  })

  it("should accept debian variants", () => {
    const debian = checkAlias("debian")
    const debian_arm64 = checkAlias("debian_arm64")

    expect([debian, debian_arm64]).toStrictEqual(["deb", "deb_arm64"])
  })

  it("should accept fedora variants", () => {
    const fedora = checkAlias("fedora")
    const fedora_arm64 = checkAlias("fedora_arm64")

    expect([fedora, fedora_arm64]).toStrictEqual(["rpm", "rpm_arm64"])
  })

  it("should accept AppImage variants", () => {
    const appImage = checkAlias("appimage")
    const appImage_arm64 = checkAlias("appimage_arm64")

    expect([appImage, appImage_arm64]).toStrictEqual([
      "AppImage",
      "AppImage_arm64",
    ])
  })

  it("should accept dmg variants", () => {
    const dmg = checkAlias("dmg")
    const dmg_arm64 = checkAlias("dmg_arm64")

    expect([dmg, dmg_arm64]).toStrictEqual(["dmg", "dmg_arm64"])
  })

  it("should not accept unknown platforms", () => {
    const random = checkAlias("random")
    expect(random).toBe(false)
  })
})
