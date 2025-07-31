import { NextRequest } from 'next/server'
import { POST } from '@/app/api/ai/analyze/route'

// Mock the getUser function
jest.mock('@/lib/db/queries', () => ({
  getUser: jest.fn(),
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

describe('/api/ai/analyze', () => {
  let mockGetUser: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Get the mocked function
    const { getUser } = require('@/lib/db/queries')
    mockGetUser = getUser
    
    mockGetUser.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    })
  })

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({
          type: 'timesheet',
          period: 'week',
          data: { totalHours: 40 }
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should analyze data successfully with Gemini API', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({
          type: 'timesheet',
          period: 'week',
          data: { totalHours: 40 }
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('summary')
      expect(data).toHaveProperty('recommendations')
      expect(data).toHaveProperty('trends')
      expect(data).toHaveProperty('alerts')
      expect(data).toHaveProperty('performance')
    })

    it('should handle Gemini API errors gracefully', async () => {
      // Mock Gemini API to throw an error
      const { GoogleGenerativeAI } = require('@google/generative-ai')
      const mockGemini = GoogleGenerativeAI()
      mockGemini.getGenerativeModel().generateContent.mockRejectedValue(new Error('API Error'))

      const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({
          type: 'timesheet',
          period: 'week',
          data: { totalHours: 40 }
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('summary')
      expect(data).toHaveProperty('recommendations')
      expect(data).toHaveProperty('trends')
      expect(data).toHaveProperty('alerts')
      expect(data).toHaveProperty('performance')
    })

    it('should handle invalid Gemini response gracefully', async () => {
      // Mock Gemini API to return invalid JSON
      const { GoogleGenerativeAI } = require('@google/generative-ai')
      const mockGemini = GoogleGenerativeAI()
      mockGemini.getGenerativeModel().generateContent.mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('invalid json')
        }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({
          type: 'timesheet',
          period: 'week',
          data: { totalHours: 40 }
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('summary')
      expect(data).toHaveProperty('recommendations')
      expect(data).toHaveProperty('trends')
      expect(data).toHaveProperty('alerts')
      expect(data).toHaveProperty('performance')
    })
  })
}) 