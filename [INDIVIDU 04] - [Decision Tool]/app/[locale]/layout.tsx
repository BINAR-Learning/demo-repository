import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Inter } from 'next/font/google';
import { BrainCircuit } from 'lucide-react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster } from '@/components/ui/toaster';
import React from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'id' }];
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  let messages;

  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <TooltipProvider>

      <html lang={locale}>
        <body className={inter.className}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
                <div className="container flex h-16 items-center justify-between">
                  <div className="mr-4 flex">
                    <a href={`/${locale}`} className="mr-6 flex items-center space-x-2">
                      <BrainCircuit className="h-6 w-6" />
                      <span className="font-bold">Decision Maker Lab</span>
                    </a>
                  </div>
                  <LanguageSwitcher />
                </div>
              </header>
              {children}
            </div>
            <Toaster /> 
          </NextIntlClientProvider>
        </body>
      </html>
    </TooltipProvider>
  );
}
