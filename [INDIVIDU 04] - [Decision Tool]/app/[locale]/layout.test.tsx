import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock next-intl and next/navigation
vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: any) => <>{children}</>,
}));
vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('notFound'); },
}));

// Mock font and icons
vi.mock('next/font/google', () => ({ Inter: () => ({ className: 'font-sans' }) }));
vi.mock('lucide-react', () => ({ BrainCircuit: () => <svg data-testid="brain-circuit" /> }));

// Mock Radix TooltipProvider and Toaster
vi.mock('@radix-ui/react-tooltip', () => ({ TooltipProvider: ({ children }: any) => <>{children}</> }));
vi.mock('@/components/ui/toaster', () => ({ Toaster: () => <div data-testid="toaster" /> }));
vi.mock('@/components/language-switcher', () => ({ LanguageSwitcher: () => <div data-testid="language-switcher" /> }));

// Import the layout after mocks
import RootLayout from './layout';

describe('Locale RootLayout', () => {
  it('renders children and layout elements', async () => {
    const Child = () => <div>Test Child</div>;
    // @ts-ignore: async component
    const Layout = await RootLayout({ children: <Child />, params: { locale: 'en' } });
    render(Layout);
    expect(screen.getByText('Test Child')).toBeInTheDocument();
    expect(screen.getByText('Decision Maker Lab')).toBeInTheDocument();
    expect(screen.getByTestId('brain-circuit')).toBeInTheDocument();
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('throws notFound for missing locale', async () => {
    // @ts-ignore: async component
    await expect(RootLayout({ children: <div />, params: { locale: 'xx' } })).rejects.toThrow('notFound');
  });
});
