import { describe, it, expect, beforeEach } from 'vitest'
import { createConfigStore } from './config-store'

const testConfig = {
  version: '1.0.0',
  menuItems: [
    { title: 'Főoldal', url: '/', icon: 'house' as const },
  ],
  featureFlags: { zipCodeResolver: true },
}

describe('ConfigStore', () => {
  let store: ReturnType<typeof createConfigStore>

  beforeEach(() => {
    store = createConfigStore()
  })

  it('has null config as default state', () => {
    expect(store.getState().config).toBeNull()
  })

  it('setConfig updates config', () => {
    store.getState().actions.setConfig(testConfig)
    expect(store.getState().config).toEqual(testConfig)
  })

  it('setConfig overwrites previous config', () => {
    store.getState().actions.setConfig(testConfig)
    const updatedConfig = { ...testConfig, version: '2.0.0' }
    store.getState().actions.setConfig(updatedConfig)
    expect(store.getState().config?.version).toBe('2.0.0')
  })

  it('setConfig preserves all fields', () => {
    store.getState().actions.setConfig(testConfig)
    const cfg = store.getState().config!
    expect(cfg.version).toBe('1.0.0')
    expect(cfg.menuItems).toHaveLength(1)
    expect(cfg.featureFlags.zipCodeResolver).toBe(true)
  })
})
