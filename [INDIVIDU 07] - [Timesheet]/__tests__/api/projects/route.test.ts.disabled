import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/projects/route'
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

describe('/api/projects', () => {
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
    it('should return 400 when team ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Team ID is required')
    })

    it('should return projects for the user', async () => {
      const mockProjects = [
        {
          id: 1,
          name: 'Test Project',
          description: 'Test project description',
          teamId: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }
      ]

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockProjects),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/projects?teamId=1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('name')
      expect(data[0]).toHaveProperty('description')
      expect(data[0]).toHaveProperty('teamId')
    })
  })

  describe('POST', () => {
    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Test description',
          // Missing name and teamId
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name and team ID are required')
    })

    it('should create project successfully', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test project description',
        teamId: 1,
      }

      const mockCreatedProject = {
        id: 1,
        ...projectData,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCreatedProject]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe(projectData.name)
      expect(data.description).toBe(projectData.description)
      expect(data).toHaveProperty('id')
    })
  })

  describe('PUT', () => {
    it('should return 400 when project ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Project',
          // Missing id
        }),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Project ID and name are required')
    })

    it('should update project successfully', async () => {
      const updateData = {
        id: 1,
        name: 'Updated Project',
        description: 'Updated description',
      }

      const mockUpdatedProject = {
        ...updateData,
        teamId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedProject]),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe(updateData.name)
      expect(data.description).toBe(updateData.description)
    })
  })

  describe('DELETE', () => {
    it('should return 400 when project ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'DELETE',
        body: JSON.stringify({}),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Project ID is required')
    })

    it('should delete project successfully', async () => {
      const deleteData = { id: 1 }

      const mockDeletedProject = {
        id: 1,
        name: 'Test Project',
        description: 'Test description',
        teamId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      // Mock the database chain
      const { db } = require('@/lib/db/drizzle')
      db.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockDeletedProject]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'DELETE',
        body: JSON.stringify(deleteData),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Project deleted successfully')
    })
  })
}) 