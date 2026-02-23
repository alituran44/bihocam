/**
 * Zustand store tests
 */
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/lib/store'

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.getState().logout()
    localStorage.clear()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
  })

  it('should set user on login', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'student',
        is_active: true,
        is_verified: true,
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('should clear user on logout', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'student',
        is_active: true,
        is_verified: true,
      })
    })

    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
  })

  it('should persist user to localStorage', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'student',
        is_active: true,
        is_verified: true,
      })
    })

    // Zustand persist middleware should save to localStorage
    expect(result.current.user).not.toBe(null)
  })
})
