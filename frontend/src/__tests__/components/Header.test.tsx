/**
 * Header component tests
 */
import { render, screen } from '@testing-library/react'
import Header from '@/components/Header'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock useAuthStore
jest.mock('@/lib/store', () => ({
  useAuthStore: jest.fn(() => ({
    isAuthenticated: false,
    user: null,
    logout: jest.fn(),
  })),
}))

describe('Header Component', () => {
  it('should render header', () => {
    render(<Header />)
    // Header should render without errors
    expect(document.body).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    render(<Header />)
    const coursesLink = screen.getByText(/kurslar/i)
    expect(coursesLink).toBeInTheDocument()
  })

  it('should show login button when not authenticated', () => {
    render(<Header />)
    const loginButton = screen.getByText(/giriş yap/i)
    expect(loginButton).toBeInTheDocument()
  })

  it('should show user menu when authenticated', () => {
    const { useAuthStore } = require('@/lib/store')
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { full_name: 'Test User', email: 'test@example.com' },
      logout: jest.fn(),
    })

    render(<Header />)
    const userMenu = screen.getByText(/test user/i)
    expect(userMenu).toBeInTheDocument()
  })
})
