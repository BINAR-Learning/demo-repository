import { NextRequest } from 'next/server'
import { DELETE } from '@/app/api/timesheet/[id]/route'
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

describe('/api/timesheet/[id]', () => {
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

  describe('DELETE', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/timesheet/1')
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 when ID is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/timesheet/invalid')
      const response = await DELETE(request, { params: Promise.resolve({ id: 'invalid' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid activity ID')
    })

    it('should return 404 when activity does not exist', async () => {
      // Mock database to return empty array
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet/999')
      const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Activity not found or access denied')
    })

    it('should return 404 when activity belongs to another user', async () => {
      // Mock database to return activity belonging to another user
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 1,
            userId: 2, // Different user
            projectId: 1,
            date: '2024-01-01',
            startTime: '09:00',
            endTime: '17:00',
            category: 'Development',
            description: 'Test activity',
          }]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet/1')
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Activity not found or access denied')
    })

    it('should delete activity successfully', async () => {
      // Mock database to return activity belonging to current user
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            id: 1,
            userId: 1, // Current user
            projectId: 1,
            date: '2024-01-01',
            startTime: '09:00',
            endTime: '17:00',
            category: 'Development',
            description: 'Test activity',
          }]),
        }),
      })

      // Mock delete operation
      db.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([{
          id: 1,
          userId: 1,
          projectId: 1,
          date: '2024-01-01',
          startTime: '09:00',
          endTime: '17:00',
          category: 'Development',
          description: 'Test activity',
        }]),
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet/1')
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Activity deleted successfully')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database to throw an error
      const { db } = require('@/lib/db/drizzle')
      db.select.mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet/1')
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete timesheet activity')
    })
  })
}) 