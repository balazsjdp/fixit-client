import { describe, it, expect, beforeEach } from 'vitest'
import { defaultInitState, proRegisterStore } from './pro-register-store'

describe('ProRegisterStore – singleton', () => {
  beforeEach(() => {
    proRegisterStore.getState().actions.resetForm()
  })

  it('has correct default form state', () => {
    const { form } = proRegisterStore.getState()
    expect(form.name).toBe('')
    expect(form.phone).toBe('')
    expect(form.categoryIds).toEqual([])
    expect(form.radiusKm).toBe(20)
    expect(form.coordinates).toBeNull()
  })

  it('setName updates name', () => {
    proRegisterStore.getState().actions.setName('Kiss Péter')
    expect(proRegisterStore.getState().form.name).toBe('Kiss Péter')
  })

  it('setPhone updates phone', () => {
    proRegisterStore.getState().actions.setPhone('+36201234567')
    expect(proRegisterStore.getState().form.phone).toBe('+36201234567')
  })

  it('toggleCategory adds a category', () => {
    proRegisterStore.getState().actions.toggleCategory(1)
    expect(proRegisterStore.getState().form.categoryIds).toEqual([1])
  })

  it('toggleCategory adds multiple categories', () => {
    proRegisterStore.getState().actions.toggleCategory(1)
    proRegisterStore.getState().actions.toggleCategory(3)
    expect(proRegisterStore.getState().form.categoryIds).toEqual([1, 3])
  })

  it('toggleCategory removes an already selected category', () => {
    proRegisterStore.getState().actions.toggleCategory(1)
    proRegisterStore.getState().actions.toggleCategory(2)
    proRegisterStore.getState().actions.toggleCategory(1)
    expect(proRegisterStore.getState().form.categoryIds).toEqual([2])
  })

  it('setRadiusKm updates radius', () => {
    proRegisterStore.getState().actions.setRadiusKm(50)
    expect(proRegisterStore.getState().form.radiusKm).toBe(50)
  })

  it('setCoordinates stores GPS coordinates', () => {
    proRegisterStore.getState().actions.setCoordinates({ lat: 47.6172, lng: 18.9812 })
    expect(proRegisterStore.getState().form.coordinates).toEqual({
      lat: 47.6172,
      lng: 18.9812,
    })
  })

  it('setCoordinates accepts null to clear', () => {
    proRegisterStore.getState().actions.setCoordinates({ lat: 47.6172, lng: 18.9812 })
    proRegisterStore.getState().actions.setCoordinates(null)
    expect(proRegisterStore.getState().form.coordinates).toBeNull()
  })

  it('resetForm clears all fields to defaults', () => {
    proRegisterStore.getState().actions.setName('Kiss Péter')
    proRegisterStore.getState().actions.setPhone('+36201234567')
    proRegisterStore.getState().actions.toggleCategory(1)
    proRegisterStore.getState().actions.setRadiusKm(50)
    proRegisterStore.getState().actions.setCoordinates({ lat: 47.6172, lng: 18.9812 })

    proRegisterStore.getState().actions.resetForm()

    const { form } = proRegisterStore.getState()
    expect(form.name).toBe('')
    expect(form.phone).toBe('')
    expect(form.categoryIds).toEqual([])
    expect(form.radiusKm).toBe(defaultInitState.form.radiusKm)
    expect(form.coordinates).toBeNull()
  })
})
