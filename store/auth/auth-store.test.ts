import { describe, it, expect, beforeEach } from 'vitest'
import { createAuthStore, defaultInitState } from './auth-store'
import { UserRole } from './auth-store'

const testUser = {
  id: 'user-123',
  firstName: 'Teszt',
  lastName: 'Felhasználó',
  email: 'test@example.com',
  role: UserRole.CLIENT,
}

describe('AuthStore', () => {
  let store: ReturnType<typeof createAuthStore>

  beforeEach(() => {
    store = createAuthStore()
  })

  it('has correct default state', () => {
    const state = store.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('login sets user, token and isAuthenticated', () => {
    store.getState().actions.login(testUser, 'my-jwt-token')
    const state = store.getState()
    expect(state.user).toEqual(testUser)
    expect(state.token).toBe('my-jwt-token')
    expect(state.isAuthenticated).toBe(true)
  })

  it('logout clears user, token and isAuthenticated', () => {
    store.getState().actions.login(testUser, 'my-jwt-token')
    store.getState().actions.logout()
    const state = store.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('setLoading updates isLoading', () => {
    store.getState().actions.setLoading(true)
    expect(store.getState().isLoading).toBe(true)
    store.getState().actions.setLoading(false)
    expect(store.getState().isLoading).toBe(false)
  })

  it('login does not change isLoading', () => {
    store.getState().actions.setLoading(true)
    store.getState().actions.login(testUser, 'token')
    expect(store.getState().isLoading).toBe(true)
  })

  it('createAuthStore accepts custom initial state', () => {
    const customStore = createAuthStore({
      ...defaultInitState,
      isLoading: true,
    })
    expect(customStore.getState().isLoading).toBe(true)
  })
})
