import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyReports from './page'

describe('MyReports page', () => {
  it('renders the page heading', () => {
    render(<MyReports />)
    expect(screen.getByText('Bejelentett hibáim')).toBeDefined()
  })

  it('renders the subtitle', () => {
    render(<MyReports />)
    expect(screen.getByText(/Kövesse nyomon/)).toBeDefined()
  })

  it('renders "Új hiba bejelentése" link', () => {
    render(<MyReports />)
    const link = screen.getByText('Új hiba bejelentése')
    expect(link).toBeDefined()
    // The link should point to /client/new
    const anchor = link.closest('a')
    expect(anchor?.getAttribute('href')).toBe('/client/new')
  })

  it('renders at least one report card', () => {
    render(<MyReports />)
    // Mock data contains "Csöpögő csap a konyhában"
    expect(screen.getByText('Csöpögő csap a konyhában')).toBeDefined()
  })

  it('renders a "Részletek" link', () => {
    render(<MyReports />)
    const link = screen.getByText('Részletek')
    const anchor = link.closest('a')
    expect(anchor?.getAttribute('href')).toContain('/client/my-reports')
  })

  it('renders category badge', () => {
    render(<MyReports />)
    expect(screen.getByText('Vízvezeték')).toBeDefined()
  })

  it('renders status badge', () => {
    render(<MyReports />)
    expect(screen.getByText('Folyamatban')).toBeDefined()
  })
})
