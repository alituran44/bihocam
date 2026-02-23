/**
 * API client tests
 */
import { api, coursesApi, authApi, lessonProgressApi, courseReviewsApi } from '@/lib/api'

// Mock axios
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }
  return {
    __esModule: true,
    default: mockAxios,
  }
})

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('authApi', () => {
    it('should login with correct credentials', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          refresh_token: 'refresh-token',
          token_type: 'bearer',
        },
      }

      const axios = require('axios').default
      axios.post.mockResolvedValue(mockResponse)

      const result = await authApi.login('test@example.com', 'password123')

      expect(axios.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.any(URLSearchParams),
        expect.any(Object)
      )
      expect(result.access_token).toBe('test-token')
    })

    it('should register new user', async () => {
      const mockResponse = {
        data: {
          id: 'user-id',
          email: 'new@example.com',
          full_name: 'New User',
        },
      }

      const axios = require('axios').default
      axios.post.mockResolvedValue(mockResponse)

      const result = await authApi.register(
        'new@example.com',
        'password123',
        'New User',
        'student'
      )

      expect(axios.post).toHaveBeenCalledWith('/auth/register', {
        email: 'new@example.com',
        password: 'password123',
        full_name: 'New User',
        role: 'student',
      })
      expect(result.email).toBe('new@example.com')
    })
  })

  describe('coursesApi', () => {
    it('should list courses', async () => {
      const mockResponse = {
        data: [
          { id: '1', title: 'Course 1' },
          { id: '2', title: 'Course 2' },
        ],
      }

      const axios = require('axios').default
      axios.get.mockResolvedValue(mockResponse)

      const result = await coursesApi.list(0, 20)

      expect(axios.get).toHaveBeenCalledWith('/courses', {
        params: { skip: 0, limit: 20 },
      })
      expect(result).toHaveLength(2)
    })

    it('should get course by id', async () => {
      const mockResponse = {
        data: { id: '1', title: 'Course 1' },
      }

      const axios = require('axios').default
      axios.get.mockResolvedValue(mockResponse)

      const result = await coursesApi.get('course-id')

      expect(axios.get).toHaveBeenCalledWith('/courses/course-id')
      expect(result.id).toBe('1')
    })

    it('should get my courses', async () => {
      const mockResponse = {
        data: [{ id: '1', title: 'My Course' }],
      }

      const axios = require('axios').default
      axios.get.mockResolvedValue(mockResponse)

      const result = await coursesApi.getMyCourses(0, 50)

      expect(axios.get).toHaveBeenCalledWith('/courses/me', {
        params: { skip: 0, limit: 50 },
      })
      expect(result).toHaveLength(1)
    })
  })

  describe('lessonProgressApi', () => {
    it('should get lesson progress', async () => {
      const mockResponse = {
        data: {
          id: 'progress-id',
          watched_seconds: 300,
          is_completed: false,
        },
      }

      const axios = require('axios').default
      axios.get.mockResolvedValue(mockResponse)

      const result = await lessonProgressApi.get('course-id', 'lesson-id')

      expect(axios.get).toHaveBeenCalledWith(
        '/courses/course-id/lessons/lesson-id/progress'
      )
      expect(result.watched_seconds).toBe(300)
    })

    it('should update lesson progress', async () => {
      const mockResponse = {
        data: {
          id: 'progress-id',
          watched_seconds: 600,
          is_completed: true,
        },
      }

      const axios = require('axios').default
      axios.post.mockResolvedValue(mockResponse)

      const result = await lessonProgressApi.update('course-id', 'lesson-id', {
        watched_seconds: 600,
        is_completed: true,
      })

      expect(axios.post).toHaveBeenCalledWith(
        '/courses/course-id/lessons/lesson-id/progress',
        { watched_seconds: 600, is_completed: true }
      )
      expect(result.is_completed).toBe(true)
    })
  })

  describe('courseReviewsApi', () => {
    it('should list course reviews', async () => {
      const mockResponse = {
        data: [
          { id: '1', rating: 5, comment: 'Great!' },
          { id: '2', rating: 4, comment: 'Good' },
        ],
      }

      const axios = require('axios').default
      axios.get.mockResolvedValue(mockResponse)

      const result = await courseReviewsApi.list('course-id', 0, 20)

      expect(axios.get).toHaveBeenCalledWith('/courses/course-id/reviews', {
        params: { skip: 0, limit: 20 },
      })
      expect(result).toHaveLength(2)
    })

    it('should create course review', async () => {
      const mockResponse = {
        data: {
          id: 'review-id',
          rating: 5,
          comment: 'Amazing course!',
        },
      }

      const axios = require('axios').default
      axios.post.mockResolvedValue(mockResponse)

      const result = await courseReviewsApi.create('course-id', {
        rating: 5,
        comment: 'Amazing course!',
      })

      expect(axios.post).toHaveBeenCalledWith('/courses/course-id/reviews', {
        rating: 5,
        comment: 'Amazing course!',
      })
      expect(result.rating).toBe(5)
    })
  })
})
