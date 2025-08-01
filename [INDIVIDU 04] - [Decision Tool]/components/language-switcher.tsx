'use client';

import React from "react";
import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/i18n/settings';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { setCookie } from '@/lib/cookies';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
  } from '@/components/ui/dropdown-menu';
import { useLocale } from 'next-intl';

const languageNames: Record<string, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Store the user's language preference
    setCookie('NEXT_LOCALE', newLocale, 365); // Store for 1 year
    
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    
    // Navigate to the same path but with the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={loc === locale ? 'bg-accent font-medium' : ''}
          >
            {languageNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}