import { GET } from '@/app/api/user/route'

// Mock the getCurrentUserWithTeam function
jest.mock('@/lib/db/queries', () => ({
  getCurrentUserWithTeam: jest.fn(),
}))

describe('/api/user', () => {
  let mockGetCurrentUserWithTeam: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Get the mocked function
    const { getCurrentUserWithTeam } = require('@/lib/db/queries')
    mockGetCurrentUserWithTeam = getCurrentUserWithTeam
  })

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUserWithTeam.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return user data with team information', async () => {
      const mockUserData = {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        team: {
          id: 1,
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      }

      mockGetCurrentUserWithTeam.mockResolvedValue(mockUserData)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(mockUserData.user.id)
      expect(data.name).toBe(mockUserData.user.name)
      expect(data.email).toBe(mockUserData.user.email)
      expect(data.role).toBe(mockUserData.user.role)
      expect(data.createdAt).toEqual(mockUserData.user.createdAt)
      expect(data.updatedAt).toEqual(mockUserData.user.updatedAt)
      expect(data.team).toEqual(mockUserData.team)
    })

    it('should return user data without team information', async () => {
      const mockUserData = {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        team: null,
      }

      mockGetCurrentUserWithTeam.mockResolvedValue(mockUserData)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(mockUserData.user.id)
      expect(data.name).toBe(mockUserData.user.name)
      expect(data.email).toBe(mockUserData.user.email)
      expect(data.role).toBe(mockUserData.user.role)
      expect(data.createdAt).toEqual(mockUserData.user.createdAt)
      expect(data.updatedAt).toEqual(mockUserData.user.updatedAt)
      expect(data.team).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      mockGetCurrentUserWithTeam.mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch user data')
    })
  })
}) 