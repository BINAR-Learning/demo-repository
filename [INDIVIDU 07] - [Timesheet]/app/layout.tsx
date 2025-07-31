import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'TimeTrack Pro - Timesheet Management System',
  description: 'Professional timesheet management system for teams. Track time, manage projects, and generate detailed reports with AI-powered insights.',
  keywords: ['timesheet', 'time tracking', 'project management', 'team collaboration', 'work hours', 'productivity', 'AI insights'],
  authors: [{ name: 'TimeTrack Pro Team' }],
  creator: 'TimeTrack Pro',
  publisher: 'TimeTrack Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://timetrackpro.com'),
  openGraph: {
    title: 'TimeTrack Pro - Timesheet Management System',
    description: 'Professional timesheet management system for teams. Track time, manage projects, and generate detailed reports with AI-powered insights.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TimeTrack Pro - Timesheet Management System',
    description: 'Professional timesheet management system for teams. Track time, manage projects, and generate detailed reports with AI-powered insights.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
