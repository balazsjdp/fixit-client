import { describe, it, expect, beforeEach } from 'vitest'
import { ReportStore, defaultInitState, reportStore } from './report-store'

const testCategory = { ID: 1, Label: 'Vízvezetékszerelő', Icon: 'wrench' }

describe('ReportStore – singleton', () => {
  beforeEach(() => {
    reportStore.getState().actions.resetForm()
  })

  it('has correct default form state', () => {
    const { form } = reportStore.getState()
    expect(form.category).toBeNull()
    expect(form.files).toEqual([])
    expect(form.description).toBe('')
    expect(form.urgency).toBe(50)
    expect(form.address.postcode).toBe('')
    expect(form.coordinates).toBeNull()
  })

  it('setCategory updates category', () => {
    reportStore.getState().actions.setCategory(testCategory as never)
    expect(reportStore.getState().form.category).toEqual(testCategory)
  })

  it('setCategory accepts null to clear', () => {
    reportStore.getState().actions.setCategory(testCategory as never)
    reportStore.getState().actions.setCategory(null)
    expect(reportStore.getState().form.category).toBeNull()
  })

  it('setDescription updates description', () => {
    reportStore.getState().actions.setDescription('Csöpögő cső')
    expect(reportStore.getState().form.description).toBe('Csöpögő cső')
  })

  it('setUrgency updates urgency', () => {
    reportStore.getState().actions.setUrgency(100)
    expect(reportStore.getState().form.urgency).toBe(100)
  })

  it('setAddress does partial merge', () => {
    reportStore.getState().actions.setAddress({ postcode: '1234', city: 'Budapest' })
    reportStore.getState().actions.setAddress({ street: 'Fő utca' })
    const { address } = reportStore.getState().form
    expect(address.postcode).toBe('1234')
    expect(address.city).toBe('Budapest')
    expect(address.street).toBe('Fő utca')
    expect(address.houseNumber).toBe('')
  })

  it('setFiles updates files', () => {
    const files = [new File(['img'], 'photo.jpg', { type: 'image/jpeg' })]
    reportStore.getState().actions.setFiles(files)
    expect(reportStore.getState().form.files).toHaveLength(1)
    expect(reportStore.getState().form.files[0].name).toBe('photo.jpg')
  })

  it('setCoordinates stores GPS coordinates', () => {
    reportStore.getState().actions.setCoordinates({ lat: 47.6172, lng: 18.9812 })
    const { coordinates } = reportStore.getState().form
    expect(coordinates).toEqual({ lat: 47.6172, lng: 18.9812 })
  })

  it('setCoordinates accepts null to clear', () => {
    reportStore.getState().actions.setCoordinates({ lat: 47.6172, lng: 18.9812 })
    reportStore.getState().actions.setCoordinates(null)
    expect(reportStore.getState().form.coordinates).toBeNull()
  })

  it('resetForm clears all fields to defaults including coordinates', () => {
    reportStore.getState().actions.setCategory(testCategory as never)
    reportStore.getState().actions.setDescription('test')
    reportStore.getState().actions.setUrgency(100)
    reportStore.getState().actions.setAddress({ city: 'Miskolc' })
    reportStore.getState().actions.setCoordinates({ lat: 47.6172, lng: 18.9812 })

    reportStore.getState().actions.resetForm()

    const { form } = reportStore.getState()
    expect(form.category).toBeNull()
    expect(form.description).toBe('')
    expect(form.urgency).toBe(50)
    expect(form.address.city).toBe('')
    expect(form.coordinates).toBeNull()
  })
})
