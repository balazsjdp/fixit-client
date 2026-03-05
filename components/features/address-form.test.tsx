import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddressForm } from './address-form'
import { createStore } from 'zustand/vanilla'
import { ReportStoreContext } from '@/store/report/report-store-provider'
import { ConfigStoreContext } from '@/store/config/config-store-provider'
import { ReportStore, defaultInitState } from '@/store/report/report-store'
import { createConfigStore } from '@/store/config/config-store'

vi.mock('@/lib/logger', () => ({
  default: { error: vi.fn(), info: vi.fn() },
}))

vi.mock('@/lib/geocoding', () => ({
  reverseGeocode: vi.fn().mockResolvedValue({
    postcode: '2085',
    city: 'Pilisvörösvár',
    street: 'Kápolna utca',
    houseNumber: '12',
  }),
  geocodeAddress: vi.fn().mockResolvedValue(null),
}))

function makeReportStore() {
  return createStore<ReportStore>((set) => ({
    form: { ...defaultInitState.form },
    actions: {
      setCategory: (category) => set((s) => ({ form: { ...s.form, category } })),
      setFiles: (files) => set((s) => ({ form: { ...s.form, files } })),
      setDescription: (description) => set((s) => ({ form: { ...s.form, description } })),
      setUrgency: (urgency) => set((s) => ({ form: { ...s.form, urgency } })),
      setAddress: (address) => set((s) => ({ form: { ...s.form, address: { ...s.form.address, ...address } } })),
      setCoordinates: (coordinates) => set((s) => ({ form: { ...s.form, coordinates } })),
      resetForm: () => set({ form: defaultInitState.form }),
    },
  }))
}

function renderForm(zipCodeResolverEnabled = false) {
  const reportStore = makeReportStore()
  const cfgStore = createConfigStore()
  cfgStore.getState().actions.setConfig({
    version: '1.0.0',
    featureFlags: { zipCodeResolver: zipCodeResolverEnabled },
  })

  return {
    reportStore,
    ...render(
      <ConfigStoreContext.Provider value={cfgStore}>
        <ReportStoreContext.Provider value={reportStore}>
          <AddressForm />
        </ReportStoreContext.Provider>
      </ConfigStoreContext.Provider>
    ),
  }
}

describe('AddressForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all 4 inputs', () => {
    renderForm()
    expect(screen.getByPlaceholderText('2085')).toBeDefined()      // postcode
    expect(screen.getByPlaceholderText('Pilisvörösvár')).toBeDefined() // city
    expect(screen.getByPlaceholderText('Fő út')).toBeDefined()     // street
    expect(screen.getByPlaceholderText('12.')).toBeDefined()        // houseNumber
  })

  it('updates postcode in store on input change', () => {
    const { reportStore } = renderForm()
    const postcodeInput = screen.getByPlaceholderText('2085')
    fireEvent.change(postcodeInput, { target: { name: 'postcode', value: '1234' } })
    expect(reportStore.getState().form.address.postcode).toBe('1234')
  })

  it('updates city in store on input change', () => {
    const { reportStore } = renderForm()
    fireEvent.change(screen.getByPlaceholderText('Pilisvörösvár'), {
      target: { name: 'city', value: 'Budapest' },
    })
    expect(reportStore.getState().form.address.city).toBe('Budapest')
  })

  it('updates street in store on input change', () => {
    const { reportStore } = renderForm()
    fireEvent.change(screen.getByPlaceholderText('Fő út'), {
      target: { name: 'street', value: 'Kossuth utca' },
    })
    expect(reportStore.getState().form.address.street).toBe('Kossuth utca')
  })

  it('updates houseNumber in store on input change', () => {
    const { reportStore } = renderForm()
    fireEvent.change(screen.getByPlaceholderText('12.'), {
      target: { name: 'houseNumber', value: '5/A' },
    })
    expect(reportStore.getState().form.address.houseNumber).toBe('5/A')
  })

  it('does NOT fetch city when zipCodeResolver flag is disabled', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({ json: async () => ({ zips: [] }) } as Response)
    renderForm(false)
    const postcodeInput = screen.getByPlaceholderText('2085')
    fireEvent.change(postcodeInput, { target: { name: 'postcode', value: '1234' } })
    await waitFor(() => expect(fetchSpy).not.toHaveBeenCalled())
  })

  it('fetches city when zipCodeResolver flag is enabled and postcode has 4 chars', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ zips: [{ name: 'Budapest' }] }),
    } as Response)

    const { reportStore } = renderForm(true)
    const postcodeInput = screen.getByPlaceholderText('2085')
    fireEvent.change(postcodeInput, { target: { name: 'postcode', value: '1234' } })

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(
      'https://hur.webmania.cc/zips/1234.json'
    ))
    await waitFor(() => expect(reportStore.getState().form.address.city).toBe('Budapest'))
  })

  it('renders GPS button', () => {
    renderForm()
    expect(screen.getByText('Helyzet automatikus meghatározása')).toBeDefined()
  })

  it('calls geolocation API on GPS button click', () => {
    const getCurrentPositionMock = vi.fn()
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: getCurrentPositionMock },
      configurable: true,
    })

    renderForm()
    fireEvent.click(screen.getByText('Helyzet automatikus meghatározása'))
    expect(getCurrentPositionMock).toHaveBeenCalledOnce()
  })

  it('sets coordinates in store on successful GPS', async () => {
    const { reportStore } = renderForm()
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 47.6172, longitude: 18.9812 } } as GeolocationPosition),
      },
      configurable: true,
    })

    fireEvent.click(screen.getByText('Helyzet automatikus meghatározása'))
    await waitFor(() =>
      expect(reportStore.getState().form.coordinates).toEqual({ lat: 47.6172, lng: 18.9812 })
    )
  })

  it('shows "Helyzet rögzítve" when coordinates are set', async () => {
    const { reportStore } = renderForm()
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 47.6172, longitude: 18.9812 } } as GeolocationPosition),
      },
      configurable: true,
    })

    fireEvent.click(screen.getByText('Helyzet automatikus meghatározása'))
    await waitFor(() => expect(reportStore.getState().form.coordinates).not.toBeNull())
    expect(screen.getByText('Helyzet rögzítve')).toBeDefined()
  })

  describe('debounced address geocoding', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('calls geocodeAddress after 1s debounce when city is changed', async () => {
      const { geocodeAddress: mockGeocode } = await import('@/lib/geocoding')
      const geocodeSpy = vi.mocked(mockGeocode).mockResolvedValue({ lat: 47.5, lng: 19.0 })

      renderForm()
      fireEvent.change(screen.getByPlaceholderText('Pilisvörösvár'), {
        target: { name: 'city', value: 'Budapest' },
      })

      expect(geocodeSpy).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1000)
      await Promise.resolve() // flush microtasks
      expect(geocodeSpy).toHaveBeenCalled()
    })

    it('sets coordinates in store when geocoding succeeds', async () => {
      const { geocodeAddress: mockGeocode } = await import('@/lib/geocoding')
      vi.mocked(mockGeocode).mockResolvedValue({ lat: 47.5, lng: 19.0 })

      const { reportStore } = renderForm()
      fireEvent.change(screen.getByPlaceholderText('Pilisvörösvár'), {
        target: { name: 'city', value: 'Budapest' },
      })

      vi.advanceTimersByTime(1000)
      await Promise.resolve()
      await Promise.resolve()
      expect(reportStore.getState().form.coordinates).toEqual({ lat: 47.5, lng: 19.0 })
    })

    it('does not call geocodeAddress if all address fields are empty', async () => {
      const { geocodeAddress: mockGeocode } = await import('@/lib/geocoding')
      const geocodeSpy = vi.mocked(mockGeocode)

      renderForm()
      // Don't change any fields – all are empty by default
      vi.advanceTimersByTime(2000)
      expect(geocodeSpy).not.toHaveBeenCalled()
    })

    it('debounces – cancels previous timer on rapid changes', async () => {
      const { geocodeAddress: mockGeocode } = await import('@/lib/geocoding')
      const geocodeSpy = vi.mocked(mockGeocode).mockResolvedValue({ lat: 47.5, lng: 19.0 })

      renderForm()
      const cityInput = screen.getByPlaceholderText('Pilisvörösvár')
      fireEvent.change(cityInput, { target: { name: 'city', value: 'B' } })
      vi.advanceTimersByTime(500) // only half debounce
      fireEvent.change(cityInput, { target: { name: 'city', value: 'Bu' } })
      vi.advanceTimersByTime(500) // only half of the new debounce
      expect(geocodeSpy).not.toHaveBeenCalled()
      vi.advanceTimersByTime(500) // now the second debounce fires
      await Promise.resolve()
      expect(geocodeSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('auto-fills address fields after GPS via reverse geocoding', async () => {
    const { reportStore } = renderForm()
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 47.6172, longitude: 18.9812 } } as GeolocationPosition),
      },
      configurable: true,
    })

    fireEvent.click(screen.getByText('Helyzet automatikus meghatározása'))
    await waitFor(() => expect(reportStore.getState().form.address.city).toBe('Pilisvörösvár'))
    expect(reportStore.getState().form.address.postcode).toBe('2085')
    expect(reportStore.getState().form.address.street).toBe('Kápolna utca')
  })
})
