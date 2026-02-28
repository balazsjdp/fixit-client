import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

vi.mock('@/app/api/client/professionals', () => ({
  useMyProfessionalProfile: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  default: { error: vi.fn(), info: vi.fn() },
}))

import { useMyProfessionalProfile } from '@/app/api/client/professionals'
import { Professional } from '@/types/professional'

const mockUseProfile = useMyProfessionalProfile as ReturnType<typeof vi.fn>

const pendingPro: Professional = {
  id: 1,
  userId: 'uuid-1',
  name: 'Kiss Péter',
  phone: '+36201234567',
  categoryIds: [1],
  radiusKm: 20,
  lat: 47.6,
  lng: 18.9,
  creditBalance: 3,
  status: 'pending',
  createdAt: '2024-01-15T10:00:00Z',
}

const approvedPro: Professional = { ...pendingPro, status: 'approved', creditBalance: 10 }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Home page – not a professional', () => {
  it('shows role-choice CTAs when user has no pro profile (404)', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      error: { response: { status: 404 } },
      isLoading: false,
    })

    render(<Home />)

    expect(screen.getByText('Kliens vagyok')).toBeTruthy()
    expect(screen.getByText('Szakember vagyok')).toBeTruthy()
  })

  it('shows new report link for clients', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      error: { response: { status: 404 } },
      isLoading: false,
    })

    render(<Home />)

    expect(screen.getByText('Új bejelentés')).toBeTruthy()
    expect(screen.getByText('Bejelentéseim megtekintése')).toBeTruthy()
  })

  it('shows pro registration link', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      error: { response: { status: 404 } },
      isLoading: false,
    })

    render(<Home />)

    expect(screen.getByText('Regisztrálás szakemberként')).toBeTruthy()
  })
})

describe('Home page – pending professional', () => {
  it('greets the pro by name', () => {
    mockUseProfile.mockReturnValue({
      data: pendingPro,
      error: undefined,
      isLoading: false,
    })

    render(<Home />)

    expect(screen.getByText(/Kiss Péter/)).toBeTruthy()
  })

  it('shows pending status', () => {
    mockUseProfile.mockReturnValue({
      data: pendingPro,
      error: undefined,
      isLoading: false,
    })

    render(<Home />)

    expect(screen.getByText('Jóváhagyásra vár')).toBeTruthy()
  })

  it('shows credit balance', () => {
    mockUseProfile.mockReturnValue({
      data: pendingPro,
      error: undefined,
      isLoading: false,
    })

    render(<Home />)

    expect(screen.getByText('3 kredit')).toBeTruthy()
  })
})

describe('Home page – approved professional', () => {
  it('shows approved status', () => {
    mockUseProfile.mockReturnValue({
      data: approvedPro,
      error: undefined,
      isLoading: false,
    })

    render(<Home />)

    expect(screen.getByText('Jóváhagyott')).toBeTruthy()
  })

  it('shows correct credit balance for approved pro', () => {
    mockUseProfile.mockReturnValue({
      data: approvedPro,
      error: undefined,
      isLoading: false,
    })

    render(<Home />)

    expect(screen.getByText('10 kredit')).toBeTruthy()
  })
})

describe('Home page – loading state', () => {
  it('shows skeletons while loading', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    const { container } = render(<Home />)

    const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
