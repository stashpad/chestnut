import { describe, expect, it } from 'vitest'
import { platformForFileName } from '../src/utils/aliases'

describe('platform', () => {
  it('Filename is MyApp-1.0.0-arm64-mac.zip', () => {
    const platform = platformForFileName('MyApp-1.0.0-arm64-mac.zip')
    expect(platform).toBe('darwin_arm64')
  })

  it('Filename is MyApp-1.0.0-arm64-mac.zip.blockmap', () => {
    const platform = platformForFileName('MyApp-1.0.0-arm64-mac.zip.blockmap')
    expect(platform).toBe(false)
  })

  it('Filename is MyApp-1.0.0-arm64.dmg', () => {
    const platform = platformForFileName('MyApp-1.0.0-arm64.dmg')
    expect(platform).toBe('dmg_arm64')
  })

  it('Filename is MyApp-1.0.0-arm64.dmg.blockmap', () => {
    const platform = platformForFileName('MyApp-1.0.0-arm64.dmg.blockmap')
    expect(platform).toBe(false)
  })

  it('Filename is MyApp-1.0.0-mac.zip', () => {
    const platform = platformForFileName('MyApp-1.0.0-mac.zip')
    expect(platform).toBe('darwin')
  })

  it('Filename is MyApp-1.0.0-mac.zip.blockmap', () => {
    const platform = platformForFileName('MyApp-1.0.0-mac.zip.blockmap')
    expect(platform).toBe(false)
  })

  it('Filename is MyApp-1.0.0.dmg', () => {
    const platform = platformForFileName('MyApp-1.0.0.dmg')
    expect(platform).toBe('dmg')
  })

  it('Filename is MyApp-1.0.0.dmg.blockmap', () => {
    const platform = platformForFileName('MyApp-1.0.0.dmg.blockmap')
    expect(platform).toBe(false)
  })

  it('Filename is MyApp-1.0.0.AppImage', () => {
    const platform = platformForFileName('MyApp-1.0.0.AppImage')
    expect(platform).toBe('AppImage')
  })

  it('Filename is MyApp-1.0.0.exe', () => {
    const platform = platformForFileName('MyApp-1.0.0.exe')
    expect(platform).toBe('exe')
  })

  it('Filename is MyApp-1.0.0.exe.blockmap', () => {
    const platform = platformForFileName('MyApp-1.0.0.exe.blockmap')
    expect(platform).toBe(false)
  })
})
