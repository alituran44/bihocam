/**
 * Courses page tests
 */
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CoursesPage from '@/app/courses/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock API
jest.mock('@/lib/api', () => ({
  coursesApi: {
    list: jest.fn(() =>
      Promise.resolve([
        {
          id: '1',
          title: 'Test Course 1',
          slug: 'test-course-1',
          price: 100,
          teacher: { full_name: 'Teacher 1' },
        },
        {
          id: '2',
          title: 'Test Course 2',
          slug: 'test-course-2',
          price: 200,
          teacher: { full_name: 'Teacher 2' },
        },
      ])
    ),
  },
  cartApi: {
    addToCart: jest.fn(),
  },
}))

// Mock useAuthStore
jest.mock('@/lib/store', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
  }),
}))

describe('Courses Page', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  it('should render courses list', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CoursesPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument()
      expect(screen.getByText('Test Course 2')).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CoursesPage />
      </QueryClientProvider>
    )

    // Loading skeleton should be visible initially
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
