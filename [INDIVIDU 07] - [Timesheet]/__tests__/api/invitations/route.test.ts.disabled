import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from '@/app/api/invitations/route'
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

describe('/api/invitations', () => {
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

      const request = new NextRequest('http://localhost:3000/api/invitations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return pending invitations for the user', async () => {
      const mockInvitations = [
        {
          id: 1,
          teamId: 1,
          teamName: 'Test Team',
          email: 'test@example.com',
          role: 'member',
          invitedBy: 1,
          invitedAt: new Date('2024-01-01'),
          status: 'pending',
        }
      ]

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockInvitations),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/invitations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('teamId')
      expect(data[0]).toHaveProperty('teamName')
      expect(data[0]).toHaveProperty('email')
      expect(data[0]).toHaveProperty('role')
      expect(data[0]).toHaveProperty('status')
    })
  })

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'POST',
        body: JSON.stringify({
          invitationId: 1,
          action: 'accept',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 when invitation ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'POST',
        body: JSON.stringify({
          action: 'accept',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invitation ID is required')
    })

    it('should return 400 when action is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'POST',
        body: JSON.stringify({
          invitationId: 1,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Action is required')
    })

    it('should accept invitation successfully', async () => {
      const acceptData = {
        invitationId: 1,
        action: 'accept',
      }

      const mockInvitation = {
        id: 1,
        teamId: 1,
        email: 'test@example.com',
        role: 'member',
        status: 'pending',
      }

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockInvitation]),
        }),
      })

      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: 1,
            userId: 1,
            teamId: 1,
            role: 'member',
            joinedAt: new Date(),
          }]),
        }),
      })

      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{
              ...mockInvitation,
              status: 'accepted',
            }]),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'POST',
        body: JSON.stringify(acceptData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe('Invitation accepted successfully')
    })

    it('should handle non-existent invitation', async () => {
      // Mock database to return empty array
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'POST',
        body: JSON.stringify({
          invitationId: 999,
          action: 'accept',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Invalid or expired invitation')
    })

    it('should handle already accepted invitation', async () => {
      const mockInvitation = {
        id: 1,
        teamId: 1,
        email: 'test@example.com',
        role: 'member',
        status: 'accepted',
      }

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockInvitation]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'POST',
        body: JSON.stringify({
          invitationId: 1,
          action: 'accept',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('You are already a member of this team')
    })
  })

  describe('DELETE', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'DELETE',
        body: JSON.stringify({
          invitationId: 1,
        }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 when invitation ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'DELETE',
        body: JSON.stringify({}),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invitation ID is required')
    })

    it('should decline invitation successfully', async () => {
      const declineData = {
        invitationId: 1,
      }

      const mockInvitation = {
        id: 1,
        teamId: 1,
        email: 'test@example.com',
        role: 'member',
        status: 'pending',
      }

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockInvitation]),
        }),
      })

      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{
              ...mockInvitation,
              status: 'declined',
            }]),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'DELETE',
        body: JSON.stringify(declineData),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe('Invitation declined successfully')
    })

    it('should handle non-existent invitation for decline', async () => {
      // Mock database to return empty array
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/invitations', {
        method: 'DELETE',
        body: JSON.stringify({
          invitationId: 999,
        }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Invalid or expired invitation')
    })
  })
}) 