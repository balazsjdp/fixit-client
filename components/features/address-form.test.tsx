import { describe, it, expect, vi, beforeEach } from 'vitest'
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

function makeReportStore() {
  return createStore<ReportStore>((set) => ({
    form: { ...defaultInitState.form },
    actions: {
      setCategory: (category) => set((s) => ({ form: { ...s.form, category } })),
      setFiles: (files) => set((s) => ({ form: { ...s.form, files } })),
      setDescription: (description) => set((s) => ({ form: { ...s.form, description } })),
      setUrgency: (urgency) => set((s) => ({ form: { ...s.form, urgency } })),
      setAddress: (address) => set((s) => ({ form: { ...s.form, address: { ...s.form.address, ...address } } })),
      resetForm: () => set({ form: defaultInitState.form }),
    },
  }))
}

function renderForm(zipCodeResolverEnabled = false) {
  const reportStore = makeReportStore()
  const cfgStore = createConfigStore()
  cfgStore.getState().actions.setConfig({
    version: '1.0.0',
    menuItems: [],
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
})
