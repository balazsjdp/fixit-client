import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminPage from './page'

// Mock useAuth
vi.mock('@/components/auth/KeycloakProvider', () => ({
  useAuth: vi.fn(),
}))

// Mock the admin API
vi.mock('@/app/api/client/admin', () => ({
  useAdminProfessionals: vi.fn(),
  approveProfessional: vi.fn().mockResolvedValue(undefined),
  addCredits: vi.fn().mockResolvedValue(undefined),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: { error: vi.fn(), info: vi.fn() },
}))

import { useAuth } from '@/components/auth/KeycloakProvider'
import {
  useAdminProfessionals,
  approveProfessional,
  addCredits,
} from '@/app/api/client/admin'
import { toast } from 'sonner'
import { Professional } from '@/types/professional'

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>
const mockUseAdminProfessionals = useAdminProfessionals as ReturnType<typeof vi.fn>
const mockApproveProfessional = approveProfessional as ReturnType<typeof vi.fn>
const mockAddCredits = addCredits as ReturnType<typeof vi.fn>
const mockToast = toast as { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> }

const adminKeycloak = {
  hasRealmRole: (role: string) => role === 'admin',
}

const mockMutate = vi.fn()

const mockProfessionals: Professional[] = [
  {
    id: 1,
    userId: 'uuid-1',
    name: 'Kiss Péter',
    phone: '+36201234567',
    categoryIds: [1],
    radiusKm: 20,
    lat: 47.6,
    lng: 18.9,
    creditBalance: 0,
    status: 'pending',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    userId: 'uuid-2',
    name: 'Nagy Anna',
    phone: '+36301234567',
    categoryIds: [2],
    radiusKm: 15,
    lat: 47.5,
    lng: 19.0,
    creditBalance: 5,
    status: 'approved',
    createdAt: '2024-01-10T08:00:00Z',
  },
]

function setupAdmin(professionals: Professional[] = mockProfessionals, isLoading = false) {
  mockUseAuth.mockReturnValue({ keycloak: adminKeycloak, isReady: true })
  mockUseAdminProfessionals.mockReturnValue({
    data: professionals,
    isLoading,
    mutate: mockMutate,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AdminPage – access control', () => {
  it('shows access denied for non-admin users', () => {
    mockUseAuth.mockReturnValue({ keycloak: { hasRealmRole: () => false }, isReady: true })
    mockUseAdminProfessionals.mockReturnValue({ data: [], isLoading: false, mutate: vi.fn() })

    render(<AdminPage />)
    expect(screen.getByText('Hozzáférés megtagadva')).toBeTruthy()
  })

  it('shows loading state while session initializes', () => {
    mockUseAuth.mockReturnValue({ keycloak: null, isReady: false })
    mockUseAdminProfessionals.mockReturnValue({ data: undefined, isLoading: true, mutate: vi.fn() })

    render(<AdminPage />)
    expect(screen.getByText('Loading secure session...')).toBeTruthy()
  })
})

describe('AdminPage – professional list', () => {
  it('renders professional list for admin users', () => {
    setupAdmin()
    render(<AdminPage />)
    expect(screen.getByText('Kiss Péter')).toBeTruthy()
    expect(screen.getByText('Nagy Anna')).toBeTruthy()
  })

  it('shows approve button only for pending professionals', () => {
    setupAdmin()
    render(<AdminPage />)
    const approveButtons = screen.getAllByText('Jóváhagyás')
    expect(approveButtons).toHaveLength(1)
  })

  it('shows pending and approved status badges', () => {
    setupAdmin()
    render(<AdminPage />)
    // "Jóváhagyásra vár" appears in the filter button
    expect(screen.getAllByText('Jóváhagyásra vár').length).toBeGreaterThanOrEqual(1)
    // Status badge text for approved professional
    expect(screen.getByText('Aktív')).toBeTruthy()
  })

  it('shows credit balance', () => {
    setupAdmin()
    render(<AdminPage />)
    expect(screen.getByText(/5 kredit/)).toBeTruthy()
  })

  it('shows empty state when no professionals found', () => {
    setupAdmin([])
    render(<AdminPage />)
    expect(screen.getByText('Nincs találat ebben a kategóriában.')).toBeTruthy()
  })

  it('shows loading skeletons while data loads', () => {
    setupAdmin([], true)
    const { container } = render(<AdminPage />)
    // Skeletons are rendered as divs with animate-pulse class
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})

describe('AdminPage – filter buttons', () => {
  it('renders all three filter buttons', () => {
    setupAdmin([])
    render(<AdminPage />)
    expect(screen.getByText('Jóváhagyásra vár')).toBeTruthy()
    expect(screen.getByText('Jóváhagyottak')).toBeTruthy()
    expect(screen.getByText('Összes')).toBeTruthy()
  })

  it('changes filter when button clicked', () => {
    setupAdmin([])
    render(<AdminPage />)
    fireEvent.click(screen.getByText('Összes'))
    // useAdminProfessionals should be called again (re-render with new filter)
    expect(mockUseAdminProfessionals).toHaveBeenCalled()
  })
})

describe('AdminPage – approve action', () => {
  it('calls approveProfessional when approve button clicked', async () => {
    mockApproveProfessional.mockResolvedValue(undefined)
    setupAdmin()
    render(<AdminPage />)

    fireEvent.click(screen.getByText('Jóváhagyás'))

    await waitFor(() => {
      expect(mockApproveProfessional).toHaveBeenCalledWith(1)
    })
  })

  it('shows success toast after approval', async () => {
    mockApproveProfessional.mockResolvedValue(undefined)
    setupAdmin()
    render(<AdminPage />)

    fireEvent.click(screen.getByText('Jóváhagyás'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Kiss Péter jóváhagyva!')
    })
  })

  it('shows error toast when approval fails', async () => {
    mockApproveProfessional.mockRejectedValue(new Error('server error'))
    setupAdmin()
    render(<AdminPage />)

    fireEvent.click(screen.getByText('Jóváhagyás'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Hiba a jóváhagyás során!')
    })
  })
})

describe('AdminPage – credit form', () => {
  it('opens credit form when Kredit button clicked', () => {
    setupAdmin()
    render(<AdminPage />)

    const creditButtons = screen.getAllByText('Kredit')
    fireEvent.click(creditButtons[0])

    expect(screen.getByPlaceholderText('pl. 50')).toBeTruthy()
  })

  it('calls addCredits with correct args when form submitted', async () => {
    mockAddCredits.mockResolvedValue(undefined)
    setupAdmin()
    render(<AdminPage />)

    const creditButtons = screen.getAllByText('Kredit')
    fireEvent.click(creditButtons[0])

    fireEvent.change(screen.getByPlaceholderText('pl. 50'), {
      target: { value: '10' },
    })
    fireEvent.change(screen.getByPlaceholderText('pl. Bónusz kredit az induláshoz'), {
      target: { value: 'Teszt' },
    })

    fireEvent.click(screen.getByText('Hozzáadás'))

    await waitFor(() => {
      expect(mockAddCredits).toHaveBeenCalledWith(1, 10, 'Teszt')
    })
  })

  it('disables the Hozzáadás button when amount is empty', () => {
    setupAdmin()
    render(<AdminPage />)

    const creditButtons = screen.getAllByText('Kredit')
    fireEvent.click(creditButtons[0])

    const addButton = screen.getByText('Hozzáadás').closest('button')!
    expect(addButton.disabled).toBe(true)
  })

  it('shows success toast after adding credits', async () => {
    mockAddCredits.mockResolvedValue(undefined)
    setupAdmin()
    render(<AdminPage />)

    const creditButtons = screen.getAllByText('Kredit')
    fireEvent.click(creditButtons[0])

    fireEvent.change(screen.getByPlaceholderText('pl. 50'), {
      target: { value: '5' },
    })
    fireEvent.click(screen.getByText('Hozzáadás'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('5 kredit hozzáadva – Kiss Péter')
    })
  })
})
