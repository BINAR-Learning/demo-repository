
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProsConsPage from '../[locale]/pros-cons/page';
vi.mock('next/navigation', () => require('./__mocks__/next-navigation.js'));
import { renderWithProviders } from './test-utils';

describe('ProsConsPage', () => {
  it('renders the Pros & Cons page header', () => {
    renderWithProviders(<ProsConsPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
