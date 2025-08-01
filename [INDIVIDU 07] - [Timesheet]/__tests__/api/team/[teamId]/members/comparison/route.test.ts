import { NextRequest } from 'next/server'
import { GET } from '@/app/api/team/[teamId]/members/comparison/route'
import { setupTestDatabase, cleanupDatabase } from '@/__tests__/utils/test-utils'

// Mock the getUser function
jest.mock('@/lib/db/queries', () => ({
  getUser: jest.fn(),
}))

// Mock the database
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  },
}))

describe('/api/team/[teamId]/members/comparison', () => {
  let mockGetUser: jest.Mock

  beforeEach(async () => {
    jest.clearAllMocks()
    await setupTestDatabase()
    
    // Get the mocked function
    const { getUser } = require('@/lib/db/queries')
    mockGetUser = getUser
    
    mockGetUser.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    })
  })

  afterEach(async () => {
    await cleanupDatabase()
  })

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/team/1/members/comparison')
      const response = await GET(request, { params: Promise.resolve({ teamId: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return comparison data for team members', async () => {
      const mockComparisonData = [
        {
          userId: 1,
          userName: 'User 1',
          totalHours: 40,
          productivityScore: 85,
          projectCount: 3,
        },
        {
          userId: 2,
          userName: 'User 2',
          totalHours: 35,
          productivityScore: 75,
          projectCount: 2,
        },
      ]

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockComparisonData),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/team/1/members/comparison')
      const response = await GET(request, { params: Promise.resolve({ teamId: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2)
      expect(data[0]).toHaveProperty('userId')
      expect(data[0]).toHaveProperty('userName')
      expect(data[0]).toHaveProperty('totalHours')
      expect(data[0]).toHaveProperty('productivityScore')
      expect(data[0]).toHaveProperty('projectCount')
    })

    it('should filter by project ID when provided', async () => {
      const mockComparisonData = [
        {
          userId: 1,
          userName: 'User 1',
          totalHours: 20,
          productivityScore: 85,
          projectCount: 1,
        },
      ]

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockComparisonData),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/team/1/members/comparison?projectId=1')
      const response = await GET(request, { params: Promise.resolve({ teamId: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
    })

    it('should handle different time periods', async () => {
      const mockComparisonData = [
        {
          userId: 1,
          userName: 'User 1',
          totalHours: 160,
          productivityScore: 85,
          projectCount: 3,
        },
      ]

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockComparisonData),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/team/1/members/comparison?period=month')
      const response = await GET(request, { params: Promise.resolve({ teamId: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
    })

    it('should return empty array when no data found', async () => {
      // Mock empty database response
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/team/1/members/comparison')
      const response = await GET(request, { params: Promise.resolve({ teamId: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)
    })

    it('should handle database errors gracefully', async () => {
      // Mock database to throw an error
      const { db } = require('@/lib/db/drizzle')
      db.select.mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = new NextRequest('http://localhost:3000/api/team/1/members/comparison')
      const response = await GET(request, { params: Promise.resolve({ teamId: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch team member comparison data')
    })
  })
}) 