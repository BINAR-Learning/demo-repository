import { NextRequest } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { users, teams, teamMembers, projects, timesheetActivities, invitations, projectMembers } from '@/lib/db/schema'

// Create a comprehensive chainable mock that returns itself for all methods
const createComprehensiveChainableMock = () => {
  const mock: { [key: string]: any } = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    values: jest.fn(),
    returning: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    innerJoin: jest.fn(),
    set: jest.fn(),
    eq: jest.fn(),
    and: jest.fn(),
    or: jest.fn(),
    desc: jest.fn(),
    asc: jest.fn(),
  }

  // Make all methods return the same mock object for chaining
  Object.keys(mock).forEach(key => {
    mock[key] = jest.fn().mockReturnValue(mock)
  })

  // Override specific methods to return promises when needed
  mock.returning.mockResolvedValue([])
  mock.orderBy.mockResolvedValue([])
  mock.limit.mockResolvedValue([])
  mock.innerJoin.mockResolvedValue([])
  mock.select.mockResolvedValue([])
  mock.insert.mockResolvedValue([])
  mock.update.mockResolvedValue([])
  mock.delete.mockResolvedValue([])

  return mock
}

// Mock the database
jest.mock('@/lib/db/drizzle', () => ({
  db: createComprehensiveChainableMock(),
}))

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            summary: 'Test summary',
            recommendations: ['Test recommendation'],
            trends: ['Test trend'],
            alerts: ['Test alert'],
            performance: {
              best: 'Test best',
              needsImprovement: 'Test improvement',
              opportunities: ['Test opportunity']
            }
          }))
        }
      })
    })
  }))
}))

// Mock user data
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'test-password-hash',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockTeam = {
  id: 1,
  name: 'Test Team',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockTeamMember = {
  id: 1,
  userId: 1,
  teamId: 1,
  role: 'owner',
  joinedAt: new Date(),
}

export const mockProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test project description',
  teamId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockTimesheetActivity = {
  id: 1,
  userId: 1,
  projectId: 1,
  date: '2024-01-01',
  startTime: '09:00',
  endTime: '17:00',
  category: 'Development',
  description: 'Test activity',
}

export const mockInvitation = {
  id: 1,
  teamId: 1,
  email: 'invited@example.com',
  role: 'member',
  invitedBy: 1,
  invitedAt: new Date(),
  status: 'pending',
}

// Individual mock functions for direct import
export const mockGetUser = jest.fn()
export const mockGetCurrentUserWithTeam = jest.fn()
export const mockGetTeamForUser = jest.fn()

// Helper function to create a mock NextRequest
export function createMockRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any
): NextRequest {
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (body) {
    // Mock the json method
    jest.spyOn(request, 'json').mockResolvedValue(body)
  }

  return request
}

// Helper function to create a mock NextRequest with search params
export function createMockRequestWithParams(
  method: string = 'GET',
  baseUrl: string = 'http://localhost:3000/api/test',
  params: Record<string, string> = {}
): NextRequest {
  const url = new URL(baseUrl)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return createMockRequest(method, url.toString())
}

// Database cleanup helper - now mocked
export async function cleanupDatabase() {
  // Mock implementation - no real database operations
  return Promise.resolve()
}

// Database setup helper - now mocked
export async function setupTestDatabase() {
  // Mock implementation - no real database operations
  return Promise.resolve()
}

// Create mock functions
export const createMockFunctions = () => {
  const mockGetUser = jest.fn()
  const mockGetCurrentUserWithTeam = jest.fn()
  const mockGetTeamForUser = jest.fn()

  return {
    mockGetUser,
    mockGetCurrentUserWithTeam,
    mockGetTeamForUser,
  }
}

// Mock GoogleGenerativeAI
export const mockGeminiResponse = {
  response: {
    text: jest.fn().mockReturnValue(JSON.stringify({
      summary: 'Test summary',
      recommendations: ['Test recommendation'],
      trends: ['Test trend'],
      alerts: ['Test alert'],
      performance: {
        best: 'Test best',
        needsImprovement: 'Test improvement',
        opportunities: ['Test opportunity']
      }
    }))
  }
}

export const mockGeminiModel = {
  generateContent: jest.fn().mockResolvedValue(mockGeminiResponse)
}

export const mockGeminiAI = {
  getGenerativeModel: jest.fn().mockReturnValue(mockGeminiModel)
} 