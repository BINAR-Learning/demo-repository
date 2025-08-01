import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/timesheet/route'
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

describe('/api/timesheet', () => {
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

      const request = new NextRequest('http://localhost:3000/api/timesheet')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return timesheet activities for the user', async () => {
      // Mock database response
      const mockActivities = [
        {
          id: 1,
          userId: 1,
          projectId: 1,
          date: '2024-01-01',
          startTime: '09:00',
          endTime: '17:00',
          category: 'Development',
          description: 'Test activity',
        }
      ]

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockActivities),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('userId')
      expect(data[0]).toHaveProperty('projectId')
      expect(data[0]).toHaveProperty('date')
      expect(data[0]).toHaveProperty('startTime')
      expect(data[0]).toHaveProperty('endTime')
      expect(data[0]).toHaveProperty('category')
      expect(data[0]).toHaveProperty('description')
    })

    it('should filter by date range', async () => {
      // Mock database response
      const mockActivities = [
        {
          id: 1,
          userId: 1,
          projectId: 1,
          date: '2024-01-01',
          startTime: '09:00',
          endTime: '17:00',
          category: 'Development',
          description: 'Activity 1',
        },
        {
          id: 2,
          userId: 1,
          projectId: 1,
          date: '2024-01-15',
          startTime: '09:00',
          endTime: '17:00',
          category: 'Development',
          description: 'Activity 2',
        },
      ]

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockActivities),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet?startDate=2024-01-01&endDate=2024-01-31')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Only activities from January
      expect(data.every((activity: any) => activity.date >= '2024-01-01' && activity.date <= '2024-01-31')).toBe(true)
    })

    it('should filter by project ID', async () => {
      // Mock database response
      const mockActivities = [
        {
          id: 1,
          userId: 1,
          projectId: 1,
          date: '2024-01-01',
          startTime: '09:00',
          endTime: '17:00',
          category: 'Development',
          description: 'Project 1 activity',
        }
      ]

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockActivities),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet?projectId=1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0].projectId).toBe(1)
    })

    it('should return empty array when no activities exist', async () => {
      // Mock empty database response
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)
    })
  })

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/timesheet', {
        method: 'POST',
        body: JSON.stringify({
          date: '2024-01-01',
          startTime: '09:00',
          endTime: '17:00',
          category: 'Development',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/timesheet', {
        method: 'POST',
        body: JSON.stringify({
          date: '2024-01-01',
          startTime: '09:00',
          // Missing endTime and category
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('should create timesheet activity successfully', async () => {
      const activityData = {
        date: '2024-01-01',
        startTime: '09:00',
        endTime: '17:00',
        category: 'Development',
        projectId: 1,
        description: 'Test activity description',
      }

      const mockCreatedActivity = {
        id: 1,
        userId: 1,
        ...activityData,
      }

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCreatedActivity]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet', {
        method: 'POST',
        body: JSON.stringify(activityData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.userId).toBe(1)
      expect(data.date).toBe(activityData.date)
      expect(data.startTime).toBe(activityData.startTime)
      expect(data.endTime).toBe(activityData.endTime)
      expect(data.category).toBe(activityData.category)
      expect(data.projectId).toBe(activityData.projectId)
      expect(data.description).toBe(activityData.description)
      expect(data).toHaveProperty('id')
    })

    it('should create activity without optional fields', async () => {
      const activityData = {
        date: '2024-01-01',
        startTime: '09:00',
        endTime: '17:00',
        category: 'Development',
        // No projectId or description
      }

      const mockCreatedActivity = {
        id: 1,
        userId: 1,
        ...activityData,
        projectId: null,
        description: null,
      }

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCreatedActivity]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/timesheet', {
        method: 'POST',
        body: JSON.stringify(activityData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.userId).toBe(1)
      expect(data.date).toBe(activityData.date)
      expect(data.startTime).toBe(activityData.startTime)
      expect(data.endTime).toBe(activityData.endTime)
      expect(data.category).toBe(activityData.category)
      expect(data.projectId).toBeNull()
      expect(data.description).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      // Mock database to throw an error
      const { db } = require('@/lib/db/drizzle')
      db.insert.mockImplementation(() => {
        throw new Error('Database error')
      })

      const activityData = {
        date: '2024-01-01',
        startTime: '09:00',
        endTime: '17:00',
        category: 'Development',
      }

      const request = new NextRequest('http://localhost:3000/api/timesheet', {
        method: 'POST',
        body: JSON.stringify(activityData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create timesheet activity')
    })
  })
}) 