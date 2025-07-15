import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware for metrics endpoint to avoid Edge Runtime issues
  if (request.nextUrl.pathname === '/api/metrics') {
    return NextResponse.next();
  }
  
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const start = Date.now();
    const method = request.method;
    const route = request.nextUrl.pathname;
    
    // Create a response that we can modify
    const response = NextResponse.next();
    
    // Add timing to response
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}; 