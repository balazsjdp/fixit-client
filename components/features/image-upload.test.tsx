import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageUpload } from './image-upload'
import { createStore } from 'zustand/vanilla'
import { ReportStoreContext } from '@/store/report/report-store-provider'
import { ReportStore, defaultInitState } from '@/store/report/report-store'

// Mock URL.createObjectURL (not available in jsdom)
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

function makeStoreWithFiles(initialFiles: File[] = []) {
  return createStore<ReportStore>((set) => ({
    form: { ...defaultInitState.form, files: initialFiles },
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

function renderImageUpload(initialFiles: File[] = []) {
  const store = makeStoreWithFiles(initialFiles)
  return {
    store,
    ...render(
      <ReportStoreContext.Provider value={store}>
        <ImageUpload />
      </ReportStoreContext.Provider>
    ),
  }
}

const makeFile = (name: string) => new File(['content'], name, { type: 'image/jpeg' })

describe('ImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the upload area', () => {
    renderImageUpload()
    expect(screen.getByText(/kattintson vagy húzza ide a képeket/i)).toBeDefined()
  })

  it('shows no image grid when no files', () => {
    const { container } = renderImageUpload()
    // No img elements
    expect(container.querySelectorAll('img')).toHaveLength(0)
  })

  it('shows images when files are present', () => {
    const files = [makeFile('photo1.jpg'), makeFile('photo2.jpg')]
    const { container } = renderImageUpload(files)
    expect(container.querySelectorAll('img')).toHaveLength(2)
  })

  it('adds files to store on file input change', () => {
    const { store } = renderImageUpload()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    const newFile = makeFile('new.jpg')
    Object.defineProperty(input, 'files', {
      value: [newFile],
      configurable: true,
    })
    fireEvent.change(input)

    expect(store.getState().form.files).toHaveLength(1)
    expect(store.getState().form.files[0].name).toBe('new.jpg')
  })

  it('appends files to existing files', () => {
    const existing = makeFile('existing.jpg')
    const { store } = renderImageUpload([existing])
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    const newFile = makeFile('new.jpg')
    Object.defineProperty(input, 'files', { value: [newFile], configurable: true })
    fireEvent.change(input)

    expect(store.getState().form.files).toHaveLength(2)
  })

  it('removes a file when X button clicked', () => {
    const files = [makeFile('a.jpg'), makeFile('b.jpg')]
    const { store } = renderImageUpload(files)

    const removeButtons = screen.getAllByRole('button')
    fireEvent.click(removeButtons[0])

    expect(store.getState().form.files).toHaveLength(1)
    expect(store.getState().form.files[0].name).toBe('b.jpg')
  })
})
