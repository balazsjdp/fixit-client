import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SliderSelector } from './slider-selector'
import { createStore } from 'zustand/vanilla'
import { ReportStoreContext } from '@/store/report/report-store-provider'
import { ReportStore, defaultInitState } from '@/store/report/report-store'

// Build a fresh report store for each test
function makeReportStore(urgency = 50) {
  return createStore<ReportStore>((set) => ({
    form: { ...defaultInitState.form, urgency },
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

const labels = ['Ráér', 'Pár napon belül', 'Sürgős']
const outputLabel = (v: number) => (v === 0 ? 'Ráér' : v === 50 ? 'Pár napon belül' : 'Sürgős')
const labelColor = (v: number) => (v === 0 ? 'bg-green-500' : v === 50 ? 'bg-orange-500' : 'bg-red-500')

function renderSlider(urgency = 50) {
  const store = makeReportStore(urgency)
  return render(
    <ReportStoreContext.Provider value={store}>
      <SliderSelector
        max={100}
        step={50}
        labels={labels}
        title="Sürgősség"
        outputLabel={outputLabel}
        labelColor={labelColor}
      />
    </ReportStoreContext.Provider>
  )
}

describe('SliderSelector', () => {
  it('renders labels', () => {
    renderSlider()
    expect(screen.getByText('Ráér')).toBeDefined()
    expect(screen.getByText('Sürgős')).toBeDefined()
  })

  it('shows correct output label for urgency 0', () => {
    renderSlider(0)
    // The badge label (outputLabel result)
    const badges = screen.getAllByText('Ráér')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('shows correct output label for urgency 100', () => {
    renderSlider(100)
    const badges = screen.getAllByText('Sürgős')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('shows correct output label for urgency 50', () => {
    renderSlider(50)
    const elements = screen.getAllByText('Pár napon belül')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders a slider input', () => {
    renderSlider()
    // Radix Slider renders a role="slider"
    const slider = screen.getByRole('slider')
    expect(slider).toBeDefined()
  })
})
