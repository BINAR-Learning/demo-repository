import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/components/ui/button', () => ({ Button: (props: any) => <button {...props} /> }));
vi.mock('lucide-react', () => ({ Globe: () => <svg data-testid="globe" /> }));
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick, ...props }: any) => <button role="option" tabIndex={0} onClick={onClick} {...props}>{children}</button>,
}));
vi.mock('@/lib/cookies', () => ({ setCookie: vi.fn() }));

import { LanguageSwitcher } from '../language-switcher';

describe('LanguageSwitcher', () => {
  it('renders and shows current language', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByTestId('globe')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /bahasa indonesia/i })).toBeInTheDocument();
  });

  it('calls router.push on language change', async () => {
    const push = vi.fn();
    vi.doMock('next/navigation', () => ({
      usePathname: () => '/en',
      useRouter: () => ({ push }),
    }));
    const { LanguageSwitcher } = await import('../language-switcher');
    render(<LanguageSwitcher />);
    const indoOption = screen.getByRole('option', { name: /bahasa indonesia/i });
    await fireEvent.click(indoOption);
    expect(push).toHaveBeenCalledWith('/id');
    vi.resetModules();
  });
});
