// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/settings';

// Function to determine the preferred locale
function getPreferredLocale(request: NextRequest): string {
  // Check for stored preference in cookies
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && locales.includes(localeCookie as any)) {
    return localeCookie;
  }

  const country = request.geo?.country?.toLowerCase();
  if (country === 'id') return 'id';
  
  // Check browser language preferences
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse the Accept-Language header
    const browserLocales = acceptLanguage
      .split(',')
      .map(item => item.split(';')[0].trim().substring(0, 2).toLowerCase());
    
    // Find the first supported locale
    for (const browserLocale of browserLocales) {
      if (locales.includes(browserLocale as any)) {
        return browserLocale;
      }
    }
  }
  
  // Fall back to default locale
  return defaultLocale;
}

// Handle root path redirection
function rootPathRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Only redirect for the root path
  if (url.pathname === '/') {
    const locale = getPreferredLocale(request);
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }
  
  return null;
}

// Create the middleware handler
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

// Export the middleware handler
export default function middleware(request: NextRequest) {
  // First check for root path redirection
  const redirectResponse = rootPathRedirect(request);
  if (redirectResponse) return redirectResponse;
  
  // Otherwise, use the intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for those starting with /api/, /_next/, /_vercel/,
  // /favicon.ico, /robots.txt, /sitemap.xml
  matcher: ['/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml).*)']
};